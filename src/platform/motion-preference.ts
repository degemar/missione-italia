const MOTION_KEY = 'missione-italia:motion';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

export const getInitialReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(MOTION_KEY) === 'reduce' || prefersReducedMotion();
  } catch {
    return prefersReducedMotion();
  }
};

export const applyReducedMotion = (reduced: boolean): void => {
  if (typeof document === 'undefined') return;
  const active = reduced || prefersReducedMotion();
  document.documentElement.dataset.motion = active ? 'reduce' : 'full';
  try {
    window.localStorage.setItem(MOTION_KEY, reduced ? 'reduce' : 'full');
  } catch {
    // The visual preference still applies for this session.
  }
};
