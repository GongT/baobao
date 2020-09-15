export const logEnable = !process.argv.includes('--quiet');

export const logExecStream = logEnable ? process.stderr : 'ignore';

function _log(msg: string, ...args: any[]) {
	console.error(msg, ...args);
}
export const log = logEnable ? _log : noop;

function _logStream(source: NodeJS.ReadableStream) {
	source.pipe(process.stderr, { end: false });
}
export const logStream = logEnable ? _logStream : noop;

export function errorLog(msg: string, ...args: any[]) {
	console.error(msg, ...args);
}

function _line(char = '-') {
	console.error(char.repeat(process.stderr.columns || 80));
}

export const line: typeof _line = logEnable ? _line : noop;

function noop(..._: any[]) {}
