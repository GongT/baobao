import { createHash } from 'crypto';

export function md5(data: Buffer | string) {
	return createHash('md5').update(data).digest().toString('hex');
}
