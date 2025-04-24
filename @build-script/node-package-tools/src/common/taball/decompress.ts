import { convertCatchedError } from '@idlebox/common';
import { unlinkSync } from 'node:fs';
import tgz from 'targz';
import { logger } from '../functions/log.js';

export async function decompressPack(src: string, dest: string) {
	logger.debug(`解压文件: ${src}\n\u3000\u3000目录: ${dest}`);
	await new Promise<void>((resolve, reject) => {
		tgz.decompress(
			{
				src,
				dest,
				tar: {
					ignore(_, header) {
						return !header || !header.name;
					},
					map(header) {
						if (header.name.startsWith('package/')) {
							header.name = header.name.replace(/^package\//, '');
						} else {
							header.name = '';
						}
						return header;
					},
				},
			},
			(e) => {
				if (e) {
					console.error(convertCatchedError(e).stack);
					unlinkSync(src);
					reject(e);
				} else {
					resolve();
				}
			}
		);
	});
	logger.debug('解压完成');
}
