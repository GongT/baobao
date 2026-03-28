import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dispose, importFile } from '../../loader/index.devel.js';

function makeSource() {
	const value = randomUUID();
	const code = `export const value = ${JSON.stringify(value)};
console.log('executed: %s', value);
`;

	writeFileSync(resolve(import.meta.dirname, '.index.ts'), code);
	return value;
}

let errs = 0;
let index = 1;
let lastValue = '';
async function next(cache) {
	const writeValue = makeSource();
	if (!lastValue) lastValue = writeValue;

	console.log('[test %d] write value: %s', index, writeValue);
	const { value } = await importFile(import.meta.resolve('./.index.ts'), { cache });
	console.log('   - imported value: %s', value);

	if (cache === false) {
		shouldEqual(value, writeValue);
	} else {
		shouldEqual(value, lastValue);
	}
	lastValue = value;

	index++;
}

process.stderr.write('\x1Bc');
await next(true);
await next(undefined);
await next(true);
await next(false);
await next(true);
await next(true);
await next(true);

dispose();

process.exitCode = errs;

function shouldEqual(actual, expected) {
	if (actual !== expected) {
		console.error(' %d \x1B[48;5;9m FAIL \x1B[0m value not equal', index);
		errs++;
	} else {
		console.log(' %d \x1B[48;5;2m PASS \x1B[0m value equal', index);
	}
}
