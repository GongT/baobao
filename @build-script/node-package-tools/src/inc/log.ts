export const logEnable = !process.argv.includes('--quiet');
const isTTY = process.stderr.isTTY;
export const logExecStream = logEnable ? process.stderr : 'ignore';

function _log(msg: string, ...args: any[]) {
	console.error(msg, ...args);
}
export const log = logEnable ? _log : noop;

export function debug(msg: string, ...args: any[]) {
	if (isTTY) {
		log('\x1B[0;2m' + msg + '\x1B[0m', ...args);
	} else {
		log(msg, ...args);
	}
}

function _logStream(source: NodeJS.ReadableStream) {
	source.pipe(process.stderr, { end: false });
}
export const logStream = logEnable ? _logStream : noop;

export function errorLog(msg: string, ...args: any[]) {
	console.error(msg, ...args);
}

function _line(char = '-') {
	console.error(char.repeat(process.stderr.columns || 40));
}

export const line: typeof _line = logEnable ? _line : noop;

function noop(..._: any[]) {}

process.on('log', (level: string, ...args: any[]) => {
	if (level === 'pause' || level === 'resume') {
		return;
	} else if (level === 'error' || level === 'notice' || level === 'warn') {
		errorLog(`[npm][${level}]`, ...args);
	} else {
		debug(`[npm][${level}]`, ...args);
	}
});
