import { exists, streamPromise } from '@idlebox/node-helpers';
import { createWriteStream } from 'fs-extra';
import { get } from 'request';
import { log } from './log';

export async function downloadIfNot(url: string, file: string) {
	if (await exists(file)) {
		log('tarball already downloaded:', file);
		return;
	}
	const writeOut = createWriteStream(file);

	log('download tarball from %s to %s', url, file);
	get(url).pipe(writeOut, { end: true });

	await streamPromise(writeOut);

	log('download complete');
}
