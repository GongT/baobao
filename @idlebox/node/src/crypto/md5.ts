import { createHash } from 'crypto';

export function md5(data: Uint8Array | string) {
	return createHash('md5').update(data).digest().toString('hex');
}
