export type SafeUpdateStatus =
  | 'idle'
  | 'waiting'
  | 'blocked-screen'
  | 'blocked-transaction'
  | 'committing'
  | 'activating'
  | 'failed';

export interface SafeUpdateSnapshot {
  readonly status: SafeUpdateStatus;
  readonly updateAvailable: boolean;
  readonly safeParentMoment: boolean;
  readonly transactionsInFlight: number;
  readonly canApply: boolean;
}

export type SafeUpdateResult =
  | {readonly status: 'applied'}
  | {readonly status: 'not-waiting' | 'blocked-screen' | 'blocked-transaction' | 'failed'};

export interface SafeUpdateDependencies {
  readonly commitLocalState: () => Promise<void>;
  readonly activateWaitingWorker: () => Promise<void>;
}

export class SafeUpdateCoordinator {
  private updateAvailable = false;
  private safeParentMoment = false;
  private transactionsInFlight = 0;
  private applying = false;
  private status: SafeUpdateStatus = 'idle';
  private readonly listeners = new Set<(snapshot: SafeUpdateSnapshot) => void>();

  constructor(private readonly dependencies: SafeUpdateDependencies) {}

  snapshot(): SafeUpdateSnapshot {
    return {
      status: this.status,
      updateAvailable: this.updateAvailable,
      safeParentMoment: this.safeParentMoment,
      transactionsInFlight: this.transactionsInFlight,
      canApply: this.updateAvailable && this.safeParentMoment && this.transactionsInFlight === 0 && !this.applying,
    };
  }

  subscribe(listener: (snapshot: SafeUpdateSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setWaiting(updateAvailable: boolean): void {
    this.updateAvailable = updateAvailable;
    this.status = updateAvailable ? 'waiting' : 'idle';
    this.emit();
  }

  setSafeParentMoment(safe: boolean): void {
    this.safeParentMoment = safe;
    if (this.updateAvailable && !safe && !this.applying) this.status = 'blocked-screen';
    else if (this.updateAvailable && !this.applying) this.status = this.transactionsInFlight ? 'blocked-transaction' : 'waiting';
    this.emit();
  }

  async trackLocalTransaction<T>(operation: () => Promise<T>): Promise<T> {
    if (this.applying) throw new UpdateActivationInProgressError();
    this.transactionsInFlight += 1;
    if (this.updateAvailable) this.status = 'blocked-transaction';
    this.emit();
    try {
      return await operation();
    } finally {
      this.transactionsInFlight -= 1;
      if (this.updateAvailable) this.status = this.safeParentMoment ? 'waiting' : 'blocked-screen';
      this.emit();
    }
  }

  async applyUpdate(): Promise<SafeUpdateResult> {
    if (!this.updateAvailable) return {status: 'not-waiting'};
    if (!this.safeParentMoment) {
      this.status = 'blocked-screen';
      this.emit();
      return {status: 'blocked-screen'};
    }
    if (this.transactionsInFlight > 0 || this.applying) {
      this.status = 'blocked-transaction';
      this.emit();
      return {status: 'blocked-transaction'};
    }

    this.applying = true;
    this.status = 'committing';
    this.emit();
    try {
      await this.dependencies.commitLocalState();
      this.status = 'activating';
      this.emit();
      await this.dependencies.activateWaitingWorker();
      this.updateAvailable = false;
      this.status = 'idle';
      return {status: 'applied'};
    } catch {
      this.status = 'failed';
      return {status: 'failed'};
    } finally {
      this.applying = false;
      this.emit();
    }
  }

  private emit(): void {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}

export class UpdateActivationInProgressError extends Error {
  constructor() {
    super('A safe application update is activating.');
    this.name = 'UpdateActivationInProgressError';
  }
}
