export function info(txt: string, ...args: any[]) {
	console.error(`\x1B[38;5;14m${txt}\x1B[0m`, ...args);
}
