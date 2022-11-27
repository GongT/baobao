import { run } from './run';

const p = process.argv[2];
if (!p) {
	console.error('usage: $0 package-dir');
	process.exit(1);
}

const re = run(p);
if (!re) {
	if (process.stdout.isTTY) {
		console.log('\x1B[48;5;10m\x1B[K✅  Test Success%s\x1B[0m');
	}
	process.exit(0);
} else {
	console.error('\x1B[48;5;9m\x1B[K⚠️  %s\x1B[0m', re);

	process.exit(1);
}
