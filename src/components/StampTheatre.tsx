import type {ButtonHTMLAttributes, HTMLAttributes, ReactNode} from 'react';

type Tone = 'tomato' | 'teal' | 'gold' | 'violet' | 'paper';

interface StampCardProps extends HTMLAttributes<HTMLElement> {
  readonly children: ReactNode;
  readonly tone?: Tone;
  readonly as?: 'article' | 'section' | 'div';
}

export function StampCard({children, tone = 'paper', as: Tag = 'section', className = '', ...props}: StampCardProps) {
  return <Tag className={`stamp-card stamp-card--${tone} ${className}`.trim()} {...props}>{children}</Tag>;
}

interface StampButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly tone?: Exclude<Tone, 'paper'>;
  readonly children: ReactNode;
}

export function StampButton({children, tone = 'tomato', className = '', type = 'button', ...props}: StampButtonProps) {
  return <button type={type} className={`stamp-button stamp-button--${tone} ${className}`.trim()} {...props}>{children}</button>;
}

export function StampMark({title = 'Missione Italia'}: {readonly title?: string}) {
  return (
    <svg className="stamp-mark" viewBox="0 0 64 64" role="img" aria-label={title}>
      <path d="M32 5 39 14l11-2 2 11 9 7-7 9 2 11-11 2-7 9-9-7-11 2-2-11-9-7 7-9-2-11 11-2 7-9Z" fill="currentColor" opacity=".18" />
      <path d="M32 11 37 18l8-1 1 8 7 5-5 7 1 8-8 1-5 7-7-5-8 1-1-8-7-5 5-7-1-8 8-1 5-7Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="m21 35 7 7 15-19" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TheatreConfetti() {
  return <span className="theatre-confetti" aria-hidden="true"><i /><i /><i /><i /><i /></span>;
}
