import {Compass, MapPinLine} from '@phosphor-icons/react';
import type {ReactNode} from 'react';

import {translate as t} from '../i18n/strings.js';
import {ParentEntry} from './ParentEntry.js';
import {StampMark} from './StampTheatre.js';

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
    <div className={`app-shell${reducedMotion ? ' reduce-motion' : ''}`}>
      <header className="top-bar">
        <div className="top-bar__actions">
          {onBack ? (
            <button className="icon-text-button" type="button" onClick={onBack}>
              {t('common.back')}
            </button>
          ) : <span className="top-bar__spacer" aria-hidden="true" />}
          {onPassport ? (
            <button className="icon-text-button" type="button" onClick={onPassport}>
              <MapPinLine aria-hidden="true" weight="bold" />
              {t('atlas.passport')}
            </button>
          ) : null}
        </div>
        <div className="brand-lockup" aria-label={t('app.label')}>
          <StampMark title={t('app.label')} />
          <span>{t('app.name')}</span>
        </div>
        {total > 0 ? (
          <p className="story-progress" aria-live="polite">
            {t('app.progress', {resolved, total})}
          </p>
        ) : null}
        {onParentOpen ? <ParentEntry onConfirmed={onParentOpen} /> : null}
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
