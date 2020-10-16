import { findRushRootPathSync } from '@build-script/rush-tools';
import { resolve } from 'path';

export const REPO_ROOT = findRushRootPathSync(__dirname)!;
export const TEMP_DIR = resolve(REPO_ROOT, 'common/temp');
export const NPM_BIN = resolve(TEMP_DIR, 'pnpm-local/node_modules/.bin/pnpm');
export const RUSH_CONFIG_PATH = resolve(REPO_ROOT, 'common/config/rush');
