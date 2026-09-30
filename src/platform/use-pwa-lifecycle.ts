import {useCallback, useEffect, useRef, useState} from 'react';
import {registerSW} from 'virtual:pwa-register';

import {
  SafeUpdateCoordinator,
  type SafeUpdateResult,
  type SafeUpdateSnapshot,
} from './safe-update.js';

export type PwaReadiness = 'checking' | 'offline-ready' | 'registration-failed';

export interface PwaLifecycleOptions {
  readonly safeParentMoment: boolean;
  readonly commitLocalState: () => Promise<void>;
}

interface PwaLifecycle {
  readonly readiness: PwaReadiness;
  readonly updateAvailable: boolean;
  readonly canApplyUpdate: boolean;
  readonly updateStatus: SafeUpdateSnapshot['status'];
  readonly applyUpdate: () => Promise<SafeUpdateResult>;
  readonly trackLocalTransaction: <T>(operation: () => Promise<T>) => Promise<T>;
}

export function usePwaLifecycle(options: PwaLifecycleOptions): PwaLifecycle {
  const [readiness, setReadiness] = useState<PwaReadiness>('checking');
  const [updateState, setUpdateState] = useState<SafeUpdateSnapshot>({
    status: 'idle', updateAvailable: false, safeParentMoment: false, transactionsInFlight: 0, canApply: false,
  });
  const commitRef = useRef(options.commitLocalState);
  const activationRef = useRef<() => Promise<void>>(async () => undefined);
  const coordinatorRef = useRef<SafeUpdateCoordinator | null>(null);
  commitRef.current = options.commitLocalState;
  if (!coordinatorRef.current) {
    coordinatorRef.current = new SafeUpdateCoordinator({
      commitLocalState: () => commitRef.current(),
      activateWaitingWorker: () => activationRef.current(),
    });
  }
  const coordinator = coordinatorRef.current;

  useEffect(() => coordinator.subscribe(setUpdateState), [coordinator]);

  useEffect(() => {
    coordinator.setSafeParentMoment(options.safeParentMoment);
  }, [coordinator, options.safeParentMoment]);

  useEffect(() => {
    let active = true;
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) setReadiness('offline-ready');
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.ready.then(
        () => { if (active) setReadiness('offline-ready'); },
        () => { if (active) setReadiness('registration-failed'); },
      );
    }
    const updateServiceWorker = registerSW({
      immediate: true,
      onNeedRefresh: () => coordinator.setWaiting(true),
      onOfflineReady: () => setReadiness('offline-ready'),
      onRegisterError: () => setReadiness('registration-failed'),
    });
    activationRef.current = () => updateServiceWorker(true);
    return () => { active = false; };
  }, [coordinator]);

  const applyUpdate = useCallback(() => coordinator.applyUpdate(), [coordinator]);
  const trackLocalTransaction = useCallback(
    <T,>(operation: () => Promise<T>) => coordinator.trackLocalTransaction(operation),
    [coordinator],
  );

  return {
    readiness,
    updateAvailable: updateState.updateAvailable,
    canApplyUpdate: updateState.canApply,
    updateStatus: updateState.status,
    applyUpdate,
    trackLocalTransaction,
  };
}
