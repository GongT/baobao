import { run } from './run';

const p = process.argv[2];
if (!p) {
	console.error('usage: $0 package-dir');
	process.exit(1);
}

run(p);
