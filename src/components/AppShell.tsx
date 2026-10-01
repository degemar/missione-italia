import {Compass, MapPinLine} from '@phosphor-icons/react';
import type {ReactNode} from 'react';

import {translate as t} from '../i18n/strings.js';
import {ParentEntry} from './ParentEntry.js';
import {StampMark} from './StampTheatre.js';
import './app-shell-r3.css';

interface AppShellProps {
  children: ReactNode;
  resolved: number;
  total: number;
  onBack?: (() => void) | undefined;
  onPassport?: (() => void) | undefined;
  banners?: string[];
  onUpdate?: (() => void) | undefined;
  updateDisabled?: boolean;
  onParentOpen?: (() => void) | undefined;
  reducedMotion?: boolean;
}

export function AppShell({
  children,
  resolved,
  total,
  onBack,
  onPassport,
  banners = [],
  onUpdate,
  updateDisabled = false,
  onParentOpen,
  reducedMotion = false,
}: AppShellProps) {
  return (
    <div className={`app-shell theatre-shell${reducedMotion ? ' reduce-motion' : ''}`}>
      <header className="top-bar theatre-top-bar">
        <div className="theatre-top-bar__sky" aria-hidden="true"><i /><i /><i /></div>
        <div className="top-bar__actions theatre-top-bar__actions">
          {onBack ? (
            <button className="icon-text-button theatre-nav-button" type="button" onClick={onBack}>
              <span aria-hidden="true">←</span>{t('common.back')}
            </button>
          ) : <span className="top-bar__spacer theatre-nav-button--ghost" aria-hidden="true" />}
          {onPassport ? (
            <button className="icon-text-button theatre-nav-button theatre-nav-button--passport" type="button" onClick={onPassport}>
              <MapPinLine aria-hidden="true" weight="bold" />
              {t('atlas.passport')}
            </button>
          ) : null}
        </div>
        <div className="brand-lockup theatre-brand" aria-label={t('app.label')}>
          <span className="theatre-brand__ticket" aria-hidden="true"><StampMark title={t('app.label')} /></span>
          <span className="theatre-brand__words"><small>{t('app.label')}</small><strong>{t('app.name')}</strong></span>
        </div>
        {total > 0 ? (
          <div className="theatre-progress" aria-live="polite">
            <span className="theatre-progress__track" aria-hidden="true"><i style={{width: `${Math.round((resolved / total) * 100)}%`}} /></span>
            <p className="story-progress">{t('app.progress', {resolved, total})}</p>
          </div>
        ) : null}
        {onParentOpen ? <div className="theatre-parent-entry"><ParentEntry onConfirmed={onParentOpen} /></div> : null}
      </header>
      {banners.map((banner) => (
        <div className="state-banner" role="status" key={banner}>
          <Compass aria-hidden="true" weight="bold" />
          <span>{banner}</span>
        </div>
      ))}
      {onUpdate ? (
        <div className="state-banner state-banner--action" role="status">
          <span>{t('app.update')}</span>
          <button className="parent-button" type="button" disabled={updateDisabled} onClick={onUpdate}>{t('app.update')}</button>
        </div>
      ) : null}
      <main id="screen-content" className="screen" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
