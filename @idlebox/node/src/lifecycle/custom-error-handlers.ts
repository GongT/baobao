import type { MyCallback } from '@idlebox/common';
import { Exit } from '@idlebox/errors';

const accurate_handler = Symbol('uncaught/handler/accurate');
const inherit_handler = Symbol('uncaught/handler/inherit');

type ErrorConstructor<E extends Error = Error> = new (...args: any[]) => E;

function checkUnsupported(ErrorClass: any) {
	if (ErrorClass.prototype === Function) {
		throw new Error(`${ErrorClass.name} is not a user defined class`);
	}
	if (ErrorClass.prototype instanceof Error === false) {
		throw new Error(`${ErrorClass.name} is not a subclass of Error`);
	}
	if (ErrorClass.prototype instanceof Exit) {
		throw new Error(`${ErrorClass.name} is a subclass of Exit`);
	}
}

/** @internal */
export function getHandlerOnError(e: Error): MyCallback<[Error]> | undefined {
	const ctor = e.constructor as any;
	if (Object.hasOwn(ctor, accurate_handler)) {
		return ctor[accurate_handler];
	}

	return (e as any)[inherit_handler];
}

export function registerNodejsGlobalTypedErrorHandlerWithInheritance<E extends Error>(ErrorCls: ErrorConstructor<E>, fn: MyCallback<[E]>) {
	if (Object.hasOwn(ErrorCls.prototype, inherit_handler)) {
		throw new Error(`duplicate register inherit uncaught handler for ${ErrorCls.name}`);
	}

	checkUnsupported(ErrorCls);

	Object.defineProperty(ErrorCls.prototype, inherit_handler, {
		configurable: true,
		enumerable: false,
		writable: true,
		value: fn,
	});
}
export function deleteNodejsGlobalTypedErrorHandler<E extends Error>(ErrorCls: ErrorConstructor<E>, withInheritance: boolean) {
	if (withInheritance) {
		if (Object.hasOwn(ErrorCls.prototype, inherit_handler)) {
			delete ErrorCls.prototype[inherit_handler];
		}
	} else {
		if (Object.hasOwn(ErrorCls, accurate_handler)) {
			delete (ErrorCls as any)[accurate_handler];
		}
	}
}
export function registerNodejsGlobalTypedErrorHandler<E extends Error>(ErrorCls: ErrorConstructor<E>, fn: MyCallback<[E]>) {
	if (Object.hasOwn(ErrorCls, accurate_handler)) {
		throw new Error(`duplicate register uncaught handler for ${ErrorCls.name}`);
	}

	if (ErrorCls.prototype === Function) {
		throw new Error(`${ErrorCls.name} is not a user defined class`);
	}
	if (ErrorCls.prototype instanceof Error === false) {
		throw new Error(`${ErrorCls.name} is not a subclass of Error`);
	}
	if (ErrorCls.prototype instanceof Exit) {
		throw new Error(`${ErrorCls.name} is a subclass of Exit`);
	}

	Object.defineProperty(ErrorCls, accurate_handler, {
		configurable: true,
		enumerable: false,
		writable: true,
		value: fn,
	});
}
