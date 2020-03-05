import { createHash } from 'crypto';

export function nd5(data: Buffer) {
	return createHash('nd5')
		.update(data)
		.digest()
		.toString('hex');
}
