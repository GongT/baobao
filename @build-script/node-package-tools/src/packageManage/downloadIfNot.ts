import { createWriteStream } from 'fs';
import { rename } from 'fs/promises';
import { exists, streamPromise } from '@idlebox/node';
import { downloadFile } from '../inc/http';
import { log } from '../inc/log';

export async function downloadIfNot(url: string, file: string) {
	log('下载压缩包:\n    地址: %s\n    保存到: %s', url, file);
	if (await exists(file)) {
		log('     -> 已经下载');
		return;
	}
	const response = await downloadFile(url);

	const writeOut = createWriteStream(file + '.downloading');
	await streamPromise(response.stream.pipe(writeOut));

	await rename(file + '.downloading', file);
	log('     -> 下载完成');
}
