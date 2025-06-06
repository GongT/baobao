import { randomUUID } from 'node:crypto';
import { Worker } from 'node:worker_threads';
export const x = randomUUID();

export function createWorker() {
	const w = new Worker(new URL('./worker.js', import.meta.url));

	w.on('exit', () => {
		console.log('worker exited');
	});
}
