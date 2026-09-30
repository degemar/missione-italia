import { DownloadSimple } from '@phosphor-icons/react';

import {translate as t} from '../i18n/strings.js';

export function InstallGuide() {
  return (
    <details className="install-guide">
      <summary>
        <DownloadSimple aria-hidden="true" weight="bold" />
        {t('install.summary')}
      </summary>
      <p>{t('install.optional')}</p>
      <p>{t('install.android')}</p>
      <p>{t('install.iphone')}</p>
    </details>
  );
}
