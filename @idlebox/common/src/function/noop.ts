import { ImpossibleError } from '@idlebox/errors';

export function noop() {}

export function negativeNoop(error: Error) {
	return function noop() {
		throw error;
	};
}

export function impossible() {
	throw new ImpossibleError('不应该执行到这里');
}
