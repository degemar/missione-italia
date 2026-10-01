import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.js';
import { DevDesignSystem } from './app/DevDesignSystem.js';
import {applyReducedMotion, getInitialReducedMotion} from './platform/motion-preference.js';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root was not found.');

applyReducedMotion(getInitialReducedMotion());
const showDesignSystem = import.meta.env.DEV && window.location.hash === '#design-system';

createRoot(root).render(
  <StrictMode>
    {showDesignSystem ? <DevDesignSystem /> : <App />}
  </StrictMode>,
);
