import { createSymbol, globalSingletonStrong } from '@idlebox/global';
import { IDisposable } from './lifecycle';
import { AsyncDisposable } from './lifecycle.async';

const symbol = createSymbol('lifecycle', 'application');

function create() {
	return new AsyncDisposable();
}

export function registerGlobalLifecycle(object: IDisposable) {
	globalSingletonStrong(symbol, create)._register(object);
}

export function disposeGlobal() {
	const obj = globalSingletonStrong<AsyncDisposable>(symbol);
	if (obj && obj.hasDisposed) {
		throw new Error('global already disposed.');
	} else if (obj) {
		return obj.dispose();
	} else {
		return Promise.resolve();
	}
}

// Note: sub-class should singleton
export abstract class LifecycleObject extends AsyncDisposable {
	/** sub-class should shutdown program */
	protected abstract done(): void;

	public async dispose(): Promise<void> {
		return super.dispose().finally(() => {
			this.done();
		});
	}
}
