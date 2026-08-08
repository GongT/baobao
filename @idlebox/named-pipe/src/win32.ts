import { join } from 'node:path';
import type { IOptions } from './fn/abs.js';
import { NamedSocket } from './socket.js';

const isPipeNamespace = /^[/\\]{2}\.[/\\]pipe[/\\]/;

export class NamedPipeWin32 extends NamedSocket {
	/**
	 * @param path 路径，必须是以/开头的绝对路径
	 */
	constructor(path: string, options: IOptions = {}) {
		if (path.startsWith('/') || path.startsWith('\\')) {
			if (!isPipeNamespace.test(path)) {
				path = join('//./pipe', path);
			}
		} else {
			throw new Error(`仅允许绝对路径 (需以/开头): ${path}`);
		}

		super(path, options);
	}

	protected override async _create() {
		// windows命名管道不用创建
	}
}
