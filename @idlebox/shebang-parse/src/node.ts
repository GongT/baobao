import { closeSync, openSync, readSync } from 'node:fs';
import { open } from 'node:fs/promises';

export * from './parse.js';

/**
 * 从文件中尝试读取 shebang 行
 */
export async function tryReadShebang(file: string) {
	await using fh = await open(file, 'r');
	const firstByte = Buffer.alloc(2);
	if ((await fh.read(firstByte)).bytesRead === 2) {
		// 0x23 = '#'
		// 0x21 = '!'
		if (firstByte[0] === 0x23 && firstByte[1] === 0x21) {
			for await (const line of fh.readLines()) {
				return `#!${line}`;
			}
		}
	}
	return null;
}

const cn = /\r?\n/;

/**
 * 从文件中尝试读取 shebang 行
 */
export function tryReadShebangSync(file: string) {
	const fh = openSync(file, 'r');
	try {
		const firstByte = Buffer.alloc(2);
		if (readSync(fh, firstByte) === 2) {
			// 0x23 = '#'
			// 0x21 = '!'
			if (firstByte[0] === 0x23 && firstByte[1] === 0x21) {
				const buffer = Buffer.alloc(1024);
				const bytesRead = readSync(fh, buffer);
				const line = buffer.toString('utf8', 0, bytesRead).split(cn)[0];
				return line;
			}
		}
		return null;
	} finally {
		closeSync(fh);
	}
}
