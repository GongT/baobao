import type { IDisposable } from './disposable.js';

export function addAnyKindOfListener(host: IEventEmitterObject | IShorthandEmitterObject, name: string, handler: Function) {
	if ('on' in host) {
		host.on(name, handler);
	} else if ('addListener' in host) {
		host.addListener(name, handler);
	}
}

export interface IShorthandEmitterObject {
	on(type: string, handler: Function): void;
	off(type: string, handler: Function): void;
}

export interface IEventEmitterObject {
	addListener(type: string, handler: Function): void;
	removeListener(type: string, handler: Function): void;
}

export function addDisposableEventListener(target: IEventEmitterObject | IShorthandEmitterObject, type: string, handler: Function): IDisposable {
	let remove: IDisposable['dispose'];

	if ('addListener' in target) {
		target.addListener(type, handler);
		remove = () => {
			target.removeListener(type, handler);
		};
	} else {
		target.on(type, handler);
		remove = () => {
			target.off(type, handler);
		};
	}
	return { dispose: remove };
}
