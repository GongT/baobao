import type { EventEmitter } from 'node:events';

export function dumpEventEmitterEmit(ev: EventEmitter) {
	const real = ev.emit;
	ev.emit = (event: string | symbol, ...args: any[]) => {
		console.log('[%s] emit:', ev.constructor.name, ...args);
		return real.call(ev, event, ...args);
	};
}
