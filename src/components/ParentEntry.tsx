import {LockKey} from '@phosphor-icons/react';
import {useEffect, useReducer, useRef, type KeyboardEvent, type MouseEvent, type PointerEvent} from 'react';

import {translate as t} from '../i18n/strings.js';
import {
  PARENT_HOLD_DURATION_MS,
  initialParentEntryState,
  reduceParentEntry,
} from '../parent/parent-controls.js';
import {AccessibleDialog} from './AccessibleDialog.js';

interface ParentEntryProps {
  readonly onConfirmed: () => void;
  readonly disabled?: boolean;
}

const holdKeys = new Set([' ', 'Enter']);

export function ParentEntry({onConfirmed, disabled = false}: ParentEntryProps) {
  const [state, dispatch] = useReducer(reduceParentEntry, initialParentEntryState);
  const keyboardGesture = useRef(false);
  const suppressNextClick = useRef(false);

  useEffect(() => {
    if (state.phase !== 'holding') return;
    const interval = window.setInterval(() => dispatch({type: 'HOLD_TICK', now: Date.now()}), 45);
    const cancel = () => {
      suppressNextClick.current = false;
      dispatch({type: 'HOLD_CANCELLED'});
    };
    document.addEventListener('visibilitychange', cancel);
    window.addEventListener('blur', cancel);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', cancel);
      window.removeEventListener('blur', cancel);
    };
  }, [state.phase]);

  const start = () => dispatch({type: 'HOLD_STARTED', now: Date.now()});
  const cancel = () => dispatch({type: 'HOLD_CANCELLED'});
  const cancelWithoutClick = () => {
    suppressNextClick.current = false;
    cancel();
  };
  const finishOrCancel = () => {
    if (state.phase !== 'holding' || state.startedAt === null) return;
    const now = Date.now();
    if (now - state.startedAt >= PARENT_HOLD_DURATION_MS) dispatch({type: 'HOLD_TICK', now});
    else cancel();
  };
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || disabled) return;
    suppressNextClick.current = true;
    start();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!holdKeys.has(event.key) || event.repeat || disabled) return;
    event.preventDefault();
    keyboardGesture.current = true;
    suppressNextClick.current = true;
    start();
  };
  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!holdKeys.has(event.key)) return;
    event.preventDefault();
    keyboardGesture.current = false;
    finishOrCancel();
  };
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      return;
    }
    if (event.detail === 0 && !keyboardGesture.current) dispatch({type: 'DIRECT_ACTIVATED'});
  };

  const closeConfirmation = () => {
    suppressNextClick.current = false;
    keyboardGesture.current = false;
    dispatch({type: 'CONFIRMATION_CLOSED'});
  };
  const confirm = () => {
    closeConfirmation();
    onConfirmed();
  };

  return (
    <>
      <button
        className="parent-entry-button"
        type="button"
        disabled={disabled}
        aria-label={t('parentEntry.accessibleLabel')}
        onPointerDown={onPointerDown}
        onPointerUp={finishOrCancel}
        onPointerCancel={cancelWithoutClick}
        onPointerLeave={() => state.phase === 'holding' && cancelWithoutClick()}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onClick={onClick}
      >
        <LockKey aria-hidden="true" weight="bold" />
        <span>{state.phase === 'holding' ? t('parentEntry.holding', {progress: state.progress}) : t('parentEntry.label')}</span>
        <span
          className="parent-hold-progress"
          role="progressbar"
          aria-label={t('parentEntry.progress')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={state.progress}
          style={{'--hold-progress': `${state.progress}%`} as React.CSSProperties}
        />
      </button>
      {state.phase === 'confirming' ? (
        <AccessibleDialog
          title={t('parentEntry.confirmTitle')}
          onClose={closeConfirmation}
          safeAction={<button className="secondary-button" type="button" onClick={closeConfirmation}>{t('parentEntry.cancel')}</button>}
          dangerousAction={<button className="parent-button primary-button" type="button" onClick={confirm}>{t('parentEntry.confirm')}</button>}
        >
          <p>{t('parentEntry.confirmBody', {seconds: PARENT_HOLD_DURATION_MS / 1000})}</p>
        </AccessibleDialog>
      ) : null}
    </>
  );
}
