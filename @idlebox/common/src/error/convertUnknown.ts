import { getErrorFrame } from './getFrame.js';

export function convertCatchedError(e: unknown): Error {
	if (e instanceof Error) {
		return e;
	} else {
		console.error('Catched invalid error at %s, type %s, value %s.', getErrorFrame(new Error(), 1), typeof e, e);
		return new Error('Invalid: ' + e);
	}
}
