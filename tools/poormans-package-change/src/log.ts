export function log(msg: string, ...args: any[]) {
	if (process.stderr.isTTY) {
		console.error(msg, ...args);
	}
}
