import { createTerminalLogger } from '../../misc/scopedLogger';
import { run } from './share';

const p = process.argv[2];
if (!p) {
	console.error('usage: $0 package-dir');
	process.exit(1);
}

const re = run(p, createTerminalLogger());
if (!re) {
	if (process.stdout.isTTY) {
		console.log('\x1B[48;5;10m ✅  Test Success  \x1B[0m\x1B[K');
	}
	process.exit(0);
} else {
	const [msg, ...res] = re.split('\n');
	console.error('\x1B[48;5;9m ⚠️  %s  \x1B[0m\x1B[K\n%s', msg, res.join('\n'));

	process.exit(1);
}