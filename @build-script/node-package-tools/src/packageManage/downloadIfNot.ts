import { exists, streamPromise } from '@idlebox/node';
import { createWriteStream } from 'fs';
import { rename } from 'fs/promises';
import { downloadFile } from '../inc/http.js';
import { logger } from '../inc/log.js';

export async function downloadIfNot(url: string, file: string) {
	logger.log('下载压缩包:\n    地址: %s\n    保存到: %s', url, file);
	if (await exists(file)) {
		logger.log('     -> 已经下载');
		return;
	}
	const response = await downloadFile(url);

	const writeOut = createWriteStream(file + '.downloading');
	await streamPromise(response.stream.pipe(writeOut));

	await rename(file + '.downloading', file);
	logger.log('     -> 下载完成');
}
