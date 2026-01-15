import { getErrorFrame } from './get-frame.js';

export function convertCaughtError(e: unknown): Error {
	if (e instanceof Error) {
		return e;
	}
	console.error('Caught invalid error at %s, type %s, value %s.', getErrorFrame(new Error(), 1), typeof e, e);
	return new Error(`Invalid: ${e}`);
}
