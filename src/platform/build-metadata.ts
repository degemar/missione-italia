import {LOCAL_DB_VERSION} from '../storage/storage-engine.js';

declare const __APP_VERSION__: string;
declare const __COMMIT_SHA__: string;

const appVersion = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.1.0';
const commitSha = typeof __COMMIT_SHA__ === 'string' ? __COMMIT_SHA__ : 'local';

export interface BuildMetadata {
  readonly appVersion: string;
  readonly databaseVersion: number;
  readonly commitSha: string;
}

export const BUILD_METADATA: BuildMetadata = Object.freeze({
  appVersion,
  databaseVersion: LOCAL_DB_VERSION,
  commitSha,
});
