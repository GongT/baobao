import { randomUUID } from 'node:crypto';
import { Worker } from 'node:worker_threads';
import whyIsNodeRunning from 'why-is-node-running';

export const x = randomUUID();

export function createWorker() {
	const w = new Worker(new URL(import.meta.resolve('./worker.js'), import.meta.url));

	w.on('exit', () => {
		console.log('worker exited');

		whyIsNodeRunning();
	});
}
