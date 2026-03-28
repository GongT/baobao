import debug from 'debug';
import type { LoadHookSync, ResolveHookSync } from 'node:module';
import { fileURLToPath } from 'node:url';

export const tryExtensions = ['.ts'];
export const runPrefixFile = fileURLToPath(import.meta.resolve('./generate-prefix.ts'));

export type NextResolve = Parameters<ResolveHookSync>[2];
export type NextLoad = Parameters<LoadHookSync>[2];

export const log = {
	main: debug('executer'),
	resolve: debug('executer:resolve'),
	load: debug('executer:load'),
	generate: debug('executer:generate'),
};
