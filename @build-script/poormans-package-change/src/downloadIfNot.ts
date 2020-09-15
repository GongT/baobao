import { exists, streamPromise } from '@idlebox/node';
import { createWriteStream } from 'fs-extra';
import { get } from 'request';
import { log } from './log';

export async function downloadIfNot(url: string, file: string) {
	log('Download tarball:\n    url: %s\n    save: %s', url, file);
	if (await exists(file)) {
		log('     -> already downloaded');
		return;
	}
	const writeOut = createWriteStream(file);

	get(url).pipe(writeOut, { end: true });

	await streamPromise(writeOut);

	log('     -> download complete');
}
