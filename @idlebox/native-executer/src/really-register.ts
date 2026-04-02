import { registerHooks } from 'node:module';
import { theState } from './tools/global.ts';
import { loadFunction } from './tools/load.ts';
import { resolveFunction } from './tools/resolve.ts';
import { log } from './tools/types.ts';

const registed = registerHooks({
	resolve: resolveFunction,
	load: loadFunction,
});
log.main('loader hooks installed');

const original = theState.dispose;
theState.dispose = () => {
	log.main('loader hooks removed');
	registed.deregister();
	original();
};
