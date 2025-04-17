import crc16 from 'crc/crc16';
import { hash_salt } from '../library/constants.js';

export function normalizePackageName(name: string) {
	return name
		.replace(/^@/, '')
		.replace(/[^a-z0-9_]/gi, '_')
		.replace(/__+/g, '_');
}

export function hash(data: string) {
	return crc16('1' + data + hash_salt).toString(16);
}

export interface IEmitFn {
	(data: any): void;
}
