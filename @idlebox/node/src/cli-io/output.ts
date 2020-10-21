export function printLine(char = '-') {
	console.error(char.repeat(process.stderr.columns || 80));
}
