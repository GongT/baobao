import { AsyncDisposable, IDisposable } from './lifecycle';

declare const global: any;
declare const window: any;

const symbol = Symbol.for('@idlebox/lifecycle/global');
const g = typeof window === 'undefined' ? global : window;

export function registerGlobalLifecycle(object: IDisposable) {
	if (!g[symbol]) {
		g[symbol] = new AsyncDisposable();
	}
	(g[symbol] as AsyncDisposable)._register(object);
}

export function disposeGlobal() {
	if (!g[symbol] || (g[symbol] as AsyncDisposable).hasDisposed) {
		throw new Error('global already disposed.');
	}
	return (g[symbol] as AsyncDisposable).dispose();
}