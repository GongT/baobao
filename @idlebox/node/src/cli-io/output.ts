export function printLine(char = '-') {
	process.stderr.write(`${char.repeat(process.stderr.columns || 10)}\r\n`);
}
