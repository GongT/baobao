import { x } from './share-lib.js';

console.log('worker is run, x=%s', x);

const t = setTimeout(() => {
	console.log('worker is done');

	process.exit(0);
}, 3000);

t.unref();
