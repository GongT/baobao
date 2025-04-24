import crc16 from 'crc/crc16';
import { hash_salt } from '../library/constants.js';

const isScope = /^@/;
const firstNoneLetter = /[^a-z0-9_]/gi;
const conitnuesUnderscore = /__+/g;

export function normalizePackageName(name: string) {
	return name.replace(isScope, '').replace(firstNoneLetter, '_').replace(conitnuesUnderscore, '_');
}

export function hash(data: string) {
	return crc16(`1${data}${hash_salt}`).toString(16);
}

export type IEmitFn = (data: any) => void;
