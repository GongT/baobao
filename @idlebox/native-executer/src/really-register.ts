import { load as loadTransform } from 'amaro/transformer';
import { registerHooks } from 'node:module';
import { theState } from './tools/global.js';
import { loadFunction } from './tools/load.js';
import { resolveFunction } from './tools/resolve.js';
import { log } from './tools/types.js';

const registed2 = registerHooks({
	load: loadTransform,
});
const registed1 = registerHooks({
	resolve: resolveFunction,
	load: loadFunction,
});

log.main('已注册module loader钩子');

const original = theState.dispose;
theState.dispose = () => {
	log.main('已移除module loader钩子');
	registed1.deregister();
	registed2.deregister();
	original?.();
};
