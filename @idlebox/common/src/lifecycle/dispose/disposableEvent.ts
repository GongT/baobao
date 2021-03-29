import { IDisposable } from './lifecycle';

declare const AbortController: new () => any;

export interface IEventListenerOptions {
	capture?: boolean;
	once?: boolean;
	passive?: boolean;
}

export interface IEventHostObject<T extends Function> {
	addEventListener(type: string, handler: T, options?: IEventListenerOptions): any;
	removeEventListener(type: string, handler: T, options?: IEventListenerOptions): any;
}

export interface IEventEmitterObject<T extends Function> {
	addListener(type: string, handler: T): any;
	removeListener(type: string, handler: T): any;
}

export function addDisposableEventListener<T extends Function>(
	target: IEventHostObject<T> | IEventEmitterObject<T>,
	type: string,
	options: IEventListenerOptions,
	handler: T
): IDisposable;

export function addDisposableEventListener<T extends Function>(
	target: IEventHostObject<T> | IEventEmitterObject<T>,
	type: string,
	handler: T
): IDisposable;

export function addDisposableEventListener<T extends Function>(
	target: IEventHostObject<T> | IEventEmitterObject<T>,
	type: string,
	_options: IEventListenerOptions | T | undefined,
	_handler?: T
): IDisposable {
	if (!_handler) {
		if (typeof _options === 'function') {
			_handler = _options;
			_options = undefined;
		} else {
			throw new Error('missing handler');
		}
	}

	const handler = _handler as T;
	const options = _options as IEventListenerOptions;

	let remove: IDisposable['dispose'];

	if ('addEventListener' in target) {
		if (passiveSupported === undefined || abortSupported === undefined) {
			checkAllSupport(target);
		}
		const [abort, xOptions] = check(options);
		target.addEventListener(type, handler, xOptions);
		if (abort) {
			remove = () => {
				abort;
			};
		} else {
			remove = () => {
				target.removeEventListener(type, handler, xOptions);
			};
		}
	} else {
		target.addListener(type, handler);
		remove = () => {
			target.removeListener(type, handler);
		};
	}
	return { dispose: remove };
}

let passiveSupported: boolean;
let abortSupported: boolean;
function check(options: IEventListenerOptions = {}): [{ abort(): void } | undefined, IEventListenerOptions] {
	if (!passiveSupported) {
		return [undefined, (options.capture || false) as any];
	}

	if (abortSupported) {
		const controller = new AbortController();
		(options as any).signal = controller.signal;
		return [controller, options];
	} else {
		return [undefined, options];
	}
}

function checkAllSupport(ele: IEventHostObject<any>) {
	passiveSupported = checkSupport('passive', ele);
	abortSupported = typeof AbortController !== 'undefined' && checkSupport('signal', ele);
}

function checkSupport(field: string, ele: IEventHostObject<any>) {
	let supported = false;
	try {
		const options = {
			get [field]() {
				// This function will be called when the browser
				//   attempts to access the passive property.
				supported = true;
				return undefined;
			},
		};

		ele.addEventListener('_test_', null, options);
		ele.removeEventListener('_test_', null, options);
	} catch (err) {
		supported = false;
	}
	return supported;
}
