import type {NarrationPackManifest} from './narration-pack.js';

export type NarratorPhase = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export interface NarratorState {
  readonly phase: NarratorPhase;
  readonly segmentId: string | null;
  readonly positionMs: number;
  readonly durationMs: number;
}

export interface NarrationAudioSource {
  readonly manifest: NarrationPackManifest;
  getAudioUrl(segmentId: string): string | null;
  getCachedAudio(segmentId: string): Promise<Blob | null>;
}

interface NarrationMedia {
  src: string;
  preload: string;
  currentTime: number;
  readonly duration: number;
  play(): Promise<void>;
  pause(): void;
  load(): void;
  removeAttribute(name: string): void;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

export interface NarratorControllerOptions {
  readonly createMedia?: () => NarrationMedia;
  readonly createObjectUrl?: (blob: Blob) => string;
  readonly revokeObjectUrl?: (url: string) => void;
}

const idleState: NarratorState = {phase: 'idle', segmentId: null, positionMs: 0, durationMs: 0};

export class NarratorController {
  private readonly listeners = new Set<(state: NarratorState) => void>();
  private readonly createMedia: () => NarrationMedia;
  private readonly createObjectUrl: (blob: Blob) => string;
  private readonly revokeObjectUrl: (url: string) => void;
  private media: NarrationMedia | null = null;
  private objectUrl: string | null = null;
  private request = 0;
  private disposed = false;
  private state: NarratorState = idleState;

  constructor(readonly source: NarrationAudioSource, options: NarratorControllerOptions = {}) {
    this.createMedia = options.createMedia ?? (() => document.createElement('audio'));
    this.createObjectUrl = options.createObjectUrl ?? ((blob) => URL.createObjectURL(blob));
    this.revokeObjectUrl = options.revokeObjectUrl ?? ((url) => URL.revokeObjectURL(url));
  }

  snapshot(): NarratorState {
    return this.state;
  }

  subscribe(listener: (state: NarratorState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  hasSegment(segmentId: string): boolean {
    return this.source.getAudioUrl(segmentId) !== null;
  }

  segmentForScriptRef(scriptRef: string): string | null {
    for (const chapter of this.source.manifest.chapters) {
      const entry = chapter.entries.find((candidate) => candidate.scriptRef === scriptRef);
      if (entry) return entry.segmentId;
    }
    return null;
  }

  async toggle(segmentId: string): Promise<void> {
    if (this.state.segmentId === segmentId && this.state.phase === 'playing') {
      this.pause();
      return;
    }
    if (this.state.segmentId === segmentId && this.state.phase === 'paused') {
      await this.resume();
      return;
    }
    await this.play(segmentId);
  }

  async play(segmentId: string): Promise<void> {
    if (this.disposed || !this.hasSegment(segmentId)) return;
    const request = ++this.request;
    this.clearSource();
    this.setState({phase: 'loading', segmentId, positionMs: 0, durationMs: 0});
    try {
      const cached = await this.source.getCachedAudio(segmentId);
      if (this.disposed || request !== this.request) return;
      const media = this.ensureMedia();
      const onlineUrl = this.source.getAudioUrl(segmentId);
      if (!onlineUrl) return;
      if (cached) {
        try {
          this.objectUrl = this.createObjectUrl(cached);
        } catch {
          this.objectUrl = null;
        }
      }
      media.src = this.objectUrl ?? onlineUrl;
      media.load();
      await media.play();
      if (this.disposed || request !== this.request) return;
      this.updateFromMedia('playing');
    } catch {
      if (!this.disposed && request === this.request) this.fail(segmentId);
    }
  }

  pause(): void {
    if (!this.media || this.state.phase !== 'playing') return;
    this.media.pause();
    this.updateFromMedia('paused');
  }

  async resume(): Promise<void> {
    if (!this.media || !this.state.segmentId) return;
    const segmentId = this.state.segmentId;
    const request = ++this.request;
    this.setState({...this.state, phase: 'loading'});
    try {
      await this.media.play();
      if (this.disposed || request !== this.request) return;
      this.updateFromMedia('playing');
    } catch {
      if (!this.disposed && request === this.request) this.fail(segmentId);
    }
  }

  async replay(segmentId: string): Promise<void> {
    if (this.state.segmentId !== segmentId || !this.media?.src) {
      await this.play(segmentId);
      return;
    }
    const request = ++this.request;
    this.media.currentTime = 0;
    this.setState({...this.state, phase: 'loading', positionMs: 0});
    try {
      await this.media.play();
      if (this.disposed || request !== this.request) return;
      this.updateFromMedia('playing');
    } catch {
      if (!this.disposed && request === this.request) this.fail(segmentId);
    }
  }

  stop(): void {
    this.request += 1;
    this.clearSource();
    this.setState(idleState);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    if (this.media) {
      this.media.removeEventListener('playing', this.onPlaying);
      this.media.removeEventListener('pause', this.onPause);
      this.media.removeEventListener('ended', this.onEnded);
      this.media.removeEventListener('timeupdate', this.onTimeUpdate);
      this.media.removeEventListener('durationchange', this.onTimeUpdate);
      this.media.removeEventListener('error', this.onError);
      this.media = null;
    }
    this.listeners.clear();
  }

  private ensureMedia(): NarrationMedia {
    if (this.media) return this.media;
    const media = this.createMedia();
    media.preload = 'metadata';
    media.addEventListener('playing', this.onPlaying);
    media.addEventListener('pause', this.onPause);
    media.addEventListener('ended', this.onEnded);
    media.addEventListener('timeupdate', this.onTimeUpdate);
    media.addEventListener('durationchange', this.onTimeUpdate);
    media.addEventListener('error', this.onError);
    this.media = media;
    return media;
  }

  private readonly onPlaying: EventListener = () => this.updateFromMedia('playing');
  private readonly onPause: EventListener = () => {
    if (this.state.phase === 'playing') this.updateFromMedia('paused');
  };
  private readonly onEnded: EventListener = () => this.updateFromMedia('ended');
  private readonly onTimeUpdate: EventListener = () => this.updateFromMedia(this.state.phase);
  private readonly onError: EventListener = () => {
    if (this.state.segmentId) this.fail(this.state.segmentId);
  };

  private updateFromMedia(phase: NarratorPhase): void {
    if (!this.media || !this.state.segmentId) return;
    const duration = Number.isFinite(this.media.duration) ? Math.max(0, this.media.duration * 1000) : 0;
    this.setState({
      phase,
      segmentId: this.state.segmentId,
      positionMs: Math.max(0, this.media.currentTime * 1000),
      durationMs: duration,
    });
  }

  private fail(segmentId: string): void {
    this.clearSource();
    this.setState({phase: 'error', segmentId, positionMs: 0, durationMs: 0});
  }

  private clearSource(): void {
    if (this.media) {
      this.media.pause();
      this.media.currentTime = 0;
      this.media.removeAttribute('src');
      this.media.load();
    }
    if (this.objectUrl) {
      this.revokeObjectUrl(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private setState(state: NarratorState): void {
    this.state = state;
    for (const listener of this.listeners) listener(state);
  }
}
