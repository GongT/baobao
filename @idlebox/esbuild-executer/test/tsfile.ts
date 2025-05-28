import { Worker } from 'node:worker_threads';
import { x } from './share-lib.js';

console.log('tsfile is run, x=%s', x);

const w = new Worker(new URL('./worker.js', import.meta.url));

w.on('exit', () => {
	console.log('worker exited');
});

export const x1 = x;
