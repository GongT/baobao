import { exists, streamPromise } from '@idlebox/node';
import { createWriteStream, move } from 'fs-extra';
import { downloadFile } from '../inc/http';
import { log } from '../inc/log';

export async function downloadIfNot(url: string, file: string) {
	log('Download tarball:\n    url: %s\n    save: %s', url, file);
	if (await exists(file)) {
		log('     -> already downloaded');
		return;
	}
	const writeOut = createWriteStream(file + '.downloading');
	const response = await downloadFile(url);

	await streamPromise(response.stream.pipe(writeOut));

	await move(file + '.downloading', file);
	log('     -> download complete');
}
