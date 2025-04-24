import { normalizePath } from '@idlebox/node';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = import.meta.dirname || dirname(fileURLToPath(import.meta.url));

export const entryRoot = normalizePath(resolve(__dirname, '../..'));
export const projectRoot = normalizePath(resolve(entryRoot, '../..'));
export const componentsRoot = normalizePath(resolve(projectRoot, 'components'));
export const tempDir = resolve(entryRoot, 'temp');
export const cacheDir = resolve(tempDir, 'vite-cache');
export const assetsDir = resolve(entryRoot, 'assets');
export const entrySourceRoot = normalizePath(resolve(entryRoot, 'src'));
export const outputDir = resolve(entryRoot, 'lib');

export const isProd = process.argv.includes('production');
export const isTTY = process.stderr.isTTY;

export const hash_salt =
	(process.env.HOSTNAME ?? process.env.COMPUTER_NAME ?? 'unknown') +
	(process.env.USER ?? process.env.USERNAME ?? 'unknown') +
	(process.env.ETAG_SALT || '');

export const isVerbose = process.argv.includes('--verbose');
