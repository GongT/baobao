import { IDisposable } from './lifecycle';

export interface IEventHostObject<T extends Function> {
	addEventListener(type: string, handler: T): any;
	removeEventListener(type: string, handler: T): any;
}

export interface IEventEmitterObject<T extends Function> {
	addListener(type: string, handler: T): any;
	removeListener(type: string, handler: T): any;
}

export function addDisposableEventListener<T extends Function>(
	target: IEventHostObject<T> | IEventEmitterObject<T>,
	type: string,
	handler: T
): IDisposable {
	if ('addEventListener' in target) {
		target.addEventListener(type, handler);
	} else {
		target.addListener(type, handler);
	}
	return {
		dispose() {
			if ('removeEventListener' in target) {
				target.removeEventListener(type, handler);
			} else {
				target.removeListener(type, handler);
			}
		},
	};
}
