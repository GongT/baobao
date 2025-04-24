import { findRushRootPathSync } from '@build-script/rush-tools';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = findRushRootPathSync(fileURLToPath(import.meta.url))!;
export const TEMP_DIR = resolve(REPO_ROOT, 'common/temp');
export const NPM_BIN = resolve(TEMP_DIR, 'pnpm-local/node_modules/.bin/pnpm');
export const RUSH_CONFIG_PATH = resolve(REPO_ROOT, 'common/config/rush');

export function normalizePackageName(name: string) {
	return name.replaceAll('/', '_').replace('@', '');
}
