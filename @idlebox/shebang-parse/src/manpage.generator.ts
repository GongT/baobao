import type { GenerateContext } from '@build-script/codegen';
import { execa } from 'execa';

const p = '/^DESCRIPTION/,/^[A-Z]/p';
const argReg = /^\s*-{1,2}\S+.+/m;
const argSingle = /(?:^|\s+)(-{1,2}[^\s[=,]+)/g;

export async function generate(_ctx: GenerateContext) {
	const manRaw = await execa`man env`.pipe(execa`col -bx`).pipe(execa`sed -n ${p}`);

	const flags = [];
	const values = [];
	for (const line of manRaw.stdout.split('\n')) {
		if (!argReg.test(line)) continue;

		// console.log('>"%s"<', line);
		const names = [];
		let hasValue = false;
		for (const match of line.matchAll(argSingle)) {
			const arg = match[1];
			const endIdx = match.index + match[0].length;
			const next = line.slice(endIdx);

			if (next[0] === '=' || next.slice(0, 2) === '[=') {
				hasValue = true;
			}
			// console.log(`arg: ${arg}[${arg.length}], next: ${next}/[${endIdx}], hasValue: ${hasValue}`);
			names.push(arg);
		}
		if (hasValue) {
			values.push(...names);
		} else {
			flags.push(...names);
		}
	}

	return `/**
 * /usr/bin/env 的flag参数
 */
export const envFlagArgs =${JSON.stringify(flags, null, 4)};

/**
 * /usr/bin/env 的有值参数
 */
export const envValueArgs = ${JSON.stringify(values, null, 4)};
	`;
}
