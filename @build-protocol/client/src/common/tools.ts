import type { BuildEvent, IMessageObject } from '../types.js';

export function make_message(event: BuildEvent, title: string, output?: string): IMessageObject {
	return {
		__brand__: 'IMessageObject',
		event,
		title,
		pid: process.pid,
		output,
	};
}
