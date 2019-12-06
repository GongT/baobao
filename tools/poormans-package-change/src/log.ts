export const logEnable = !process.argv.includes('--quiet');

export const log = logEnable ? function log(msg: string, ...args: any[]) {
	console.error(msg, ...args);
} : function noop(_: string, ...__: any[]) {

};
export const logStream = logEnable ? function logStream(source: NodeJS.ReadableStream) {
	source.pipe(process.stderr, { end: false });
} : function noop(_: NodeJS.ReadableStream) {

};

export function errorLog(msg: string, ...args: any[]) {
	console.error(msg, ...args);
}
