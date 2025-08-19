import { CanceledError } from '@idlebox/errors';
import { DeferredPromise } from './deferred-promise.js';

export class PromiseCollection {
	protected readonly promiseList: Record<string, DeferredPromise<any>> = {};

	size() {
		return Object.keys(this.promiseList).length;
	}

	create(id: string) {
		if (this.promiseList[id]) {
			throw new Error(`duplicate promise with id ${id}`);
		}
		const dfd = new DeferredPromise<any>();
		this.promiseList[id] = dfd;
		return dfd.p;
	}

	has(id: string) {
		return Object.hasOwn(this.promiseList, id);
	}

	done(id: string, data: any) {
		this.promiseList[id]?.complete(data);
		delete this.promiseList[id];
	}

	error(id: string, e: Error) {
		this.promiseList[id]?.error(e);
		delete this.promiseList[id];
	}

	dispose() {
		const e = new CanceledError();
		for (const id of Object.keys(this.promiseList)) {
			this.error(id, e);
		}
	}
}
