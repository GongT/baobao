import { randomBytes } from 'node:crypto';

export function throwError() {
	throw new Error('This is a test error');
}

export function randomString() {
	return randomBytes(32).toString('hex');
}
