import { logger as defaultLogger, type IMyLogger } from '@idlebox/cli';
import { noop, type CancellationToken } from '@idlebox/common';
import { exists } from '@idlebox/node';
import gunzipMaybe from 'gunzip-maybe';
import strict from 'node:assert/strict';
import { open, rm, unlink } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { pipeline } from 'node:stream/promises';
import tgz from 'tar-fs';

const packageFolder = /^package\//;

interface IOptions {
	readonly source: string;
	readonly destination: string;

	readonly keepSource?: boolean;
	readonly logger?: IMyLogger;
	readonly abort?: CancellationToken;
}

export async function decompressPack({ source: src, destination: dest, keepSource: keep = false, logger = defaultLogger, abort }: IOptions) {
	logger.debug(`解压文件: ${src}\n\u3000\u3000目录: ${dest}`);
	strict.ok(isAbsolute(src), `源文件路径必须是绝对路径: ${src}`);
	strict.ok(isAbsolute(dest), `目标目录路径必须是绝对路径: ${dest}`);

	if (!exists(src)) {
		throw new Error(`decompressPack: 源文件不存在: ${src}`);
	}

	await using fh = await open(src, 'r');
	if (abort) {
		abort.onCancellationRequested(() => {
			fh.close().catch(noop);
			rm(dest).catch(noop);
		});
	}

	try {
		await pipeline(
			fh.createReadStream(),
			gunzipMaybe(),
			tgz.extract(dest, {
				ignore(_, header) {
					return !header?.name;
				},
				map(header) {
					if (packageFolder.test(header.name)) {
						header.name = header.name.replace(packageFolder, '');
					} else {
						header.name = '';
					}
					return header;
				},
			}),
		);
		if (!keep) {
			try {
				await unlink(src);
			} catch {}
		}
	} catch (error) {
		logger.error(`解压失败: ${error}`);
		await rm(dest).catch(noop);
		throw error;
	}
	logger.debug('解压完成');
}
