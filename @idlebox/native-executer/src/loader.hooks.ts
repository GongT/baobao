import assert from 'node:assert';
import { registerHooks } from 'node:module';
import { loadFunction } from './tools/load.ts';
import { resolveFunction } from './tools/resolve.ts';
import { log } from './tools/types.ts';

assert.ok(!globalThis.__ts_resolver_installed__, 'Loader hooks have already been installed');

const registed = registerHooks({
	resolve: resolveFunction,
	load: loadFunction,
});

globalThis.__ts_resolver_installed__ = {
	dispose() {
		registed.deregister();
	},
};
log.main('loader hooks installed');

export function dispose() {
	globalThis.__ts_resolver_installed__.dispose();
	log.main('loader hooks removed');
}
