import { isWindows } from '@idlebox/common';
import { osTempDir } from '@idlebox/node';
import { randomBytes } from 'node:crypto';
import type { INamedPipe, IOptions } from './fn/abs.js';
import { NamedPipePosix } from './posix.js';
import { NamedPipeWin32 } from './win32.js';

let NamedPipe: typeof NamedPipePosix | typeof NamedPipeWin32;
if (isWindows) {
	NamedPipe = NamedPipeWin32;
} else {
	NamedPipe = NamedPipePosix;
}

export { NamedPipe, type INamedPipe };

/**
 * @param path 路径，必须是以/开头的绝对路径
 */
export function createNamedPipe(path: string = genTemp(), options: IOptions = {}): INamedPipe {
	return new NamedPipe(path, options);
}

function genTemp() {
	return osTempDir(`anonymous-pipe-${randomBytes(6).toString('hex')}`);
}
