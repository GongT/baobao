import { argv } from '@idlebox/args/default';
import { resolve } from 'node:path';

argv.flag(['-d', '--debug']);
argv.flag(['-w', '--watch']);

const fileArg = argv.at(0);
if (!fileArg) {
	throw new Error('No file to load');
}
const file = resolve(process.cwd(), fileArg);

process.exitCode = 0;
await import(file);
