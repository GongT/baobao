import { functionToDisposable, isWindows, registerGlobalLifecycle } from '@idlebox/common';
import { closeSync, createReadStream, createWriteStream, openSync } from 'node:fs';
import { Terminal } from './api.js';

let fd;
if (isWindows) {
	fd = openSync('//./con', 'w+');
} else {
	fd = openSync('/dev/tty', 'w+');
}

const w = createWriteStream('', { fd, encoding: 'utf-8' });
const r = createReadStream('', { fd, encoding: 'utf-8' });
const t = new Terminal(w, r);

t._register(
	functionToDisposable(function closeFileDescripter() {
		closeSync(fd);
	}),
);

registerGlobalLifecycle(t, true);

export const hostTerminal = t;
export * from './api.js';
