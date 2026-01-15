import { convertCatchedError } from '@idlebox/common';
import { logger } from '@idlebox/cli';
import { existsSync, unlinkSync } from 'node:fs';
import tgz from 'targz';

const packageFolder = /^package\//;

export async function decompressPack(src: string, dest: string) {
	logger.debug(`解压文件: ${src}\n\u3000\u3000目录: ${dest}`);
	await new Promise<void>((resolve, reject) => {
		if (!existsSync(src)) {
			throw new Error(`decompressPack: 源文件不存在: ${src}`);
		}

		tgz.decompress(
			{
				src,
				dest,
				tar: {
					ignore(_, header) {
						return !header || !header.name;
					},
					map(header) {
						if (packageFolder.test(header.name)) {
							header.name = header.name.replace(packageFolder, '');
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
					try {
						unlinkSync(src);
					} catch {}
					reject(e);
				} else {
					resolve();
				}
			},
		);
	});
	logger.debug('解压完成');
}
