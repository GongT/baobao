import { findRushRootPathSync } from '@idlebox/rush-tools';
import { resolve } from 'path';

export const REPO_ROOT = findRushRootPathSync(__dirname)!;
export const TEMP_DIR = resolve(REPO_ROOT, 'common/temp');
export const NPM_BIN = resolve(TEMP_DIR, 'pnpm-local/node_modules/.bin/pnpm');