import { resolve } from 'path';
import { globSync } from 'glob';
import { createTerminalLogger } from '../../misc/scopedLogger';
import { run } from './share';

const p = process.argv[2];
if (!p) {
	console.error('usage: $0 package-dir');
	process.exit(1);
}

const root = resolve(process.cwd(), p);

const files = globSync('**/*.generator.{ts,js}', { ignore: ['node_modules/**'], cwd: root, absolute: true });

try {
	run(files, createTerminalLogger());

	if (process.stdout.isTTY) {
		console.log('\x1B[48;5;10m\x1B[K✅  Generate Complete%s\x1B[0m');
	}
	process.exit(0);
} catch (e: any) {
	console.error('\x1B[48;5;9m\x1B[K⚠️  Generate Fail: %s\x1B[0m', e.message);
	process.exit(1);
}
