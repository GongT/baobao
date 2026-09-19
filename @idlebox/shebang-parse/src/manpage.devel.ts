import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const { generate } = await import('./manpage' + '.generator.ts'); // prevent ".ts" import check

export const envFlagArgs: readonly string[] = [];
export const envValueArgs: readonly string[] = [];

const outputFile = resolve(import.meta.dirname, 'manpage.generated.ts');
if (existsSync(outputFile)) {
	process.stdout.write(readFileSync(outputFile));
} else {
	const r = await generate();
	writeFileSync(outputFile, r);
	console.log(r);
}
process.exit(0);
