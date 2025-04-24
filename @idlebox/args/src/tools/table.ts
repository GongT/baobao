import { boxText, supports } from 'cjke-strings';

function testTerm() {
	if (process.env.TERM_PROGRAM === 'vscode') {
		return supports.vscodeIntegrated;
	}
	if (process.env.TERM?.startsWith('xterm')) {
		return supports.everything;
	}
	if (process.env.WT_SESSION) {
		return supports.everything;
	}

	return supports.nothing;
}

export function printTwoColumn(table: ReadonlyArray<readonly [string, string]>) {
	const support = testTerm();
	let maxLeft = 0;
	for (const [left] of table) {
		const lwidth = left.length;

		maxLeft = Math.max(maxLeft, lwidth);
	}

	const fullWidth = (process.stderr.columns || 84) - 4;

	if (maxLeft > fullWidth) {
		process.stderr.write(table.map((v) => v.join('  ')).join('\n'));
		return;
	}

	const maxRight = fullWidth - maxLeft - 2;
	console.log(`fullWidth=${fullWidth}, maxLeft=${maxLeft}, maxRight=${maxRight}`);
	for (const [left, right] of table) {
		const lines = boxText(right, maxRight, support);
		const first = lines.shift();

		process.stderr.write(`${left.padStart(maxLeft, ' ')}  ${first}\n`);
		for (const line of lines) {
			process.stderr.write(`${' '.repeat(maxLeft + 2) + line}\n`);
		}
	}
}
