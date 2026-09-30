import {useEffect, useRef, type KeyboardEvent, type ReactNode} from 'react';

interface AccessibleDialogProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly safeAction: ReactNode;
  readonly dangerousAction?: ReactNode;
}

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function AccessibleDialog({title, children, onClose, safeAction, dangerousAction}: AccessibleDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const safeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (!dialog?.open) dialog?.showModal();
    const frame = requestAnimationFrame(() => safeRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus());
    return () => {
      cancelAnimationFrame(frame);
      if (dialog?.open) dialog.close();
      previous?.focus();
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = [...(panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])];
    if (!controls.length) return;
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <dialog
      className="dialog-backdrop"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        className="dialog-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onKeyDown={onKeyDown}
      >
        <h2 id="dialog-title">{title}</h2>
        <div>{children}</div>
        <div className="dialog-actions">
          <div ref={safeRef}>{safeAction}</div>
          {dangerousAction ? <div>{dangerousAction}</div> : null}
        </div>
      </div>
    </dialog>
  );
}
