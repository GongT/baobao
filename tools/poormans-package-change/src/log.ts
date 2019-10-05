export const logEnable = !process.argv.includes('--quiet');

export const log = logEnable ? function log(msg: string, ...args: any[]) {
	console.error(msg, ...args);
} : function noop(_: string, ...__: any[]) {

};

export function errorLog(msg: string, ...args: any[]) {
	console.error(msg, ...args);
}
