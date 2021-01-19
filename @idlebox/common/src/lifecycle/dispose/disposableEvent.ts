import { IDisposable } from './lifecycle';
export interface IEventHostObject<T extends Function> {
	addEventListener(type: string, handler: T): any;
	removeEventListener(type: string, handler: T): any;
}

export function addDisposableEventListener<T extends Function>(
	target: IEventHostObject<T>,
	type: string,
	handler: T
): IDisposable {
	target.addEventListener(type, handler);
	return {
		dispose() {
			target.removeEventListener(type, handler);
		},
	};
}
