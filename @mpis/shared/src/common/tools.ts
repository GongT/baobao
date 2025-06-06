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

export function is_message(obj: any): obj is IMessageObject {
	return obj && typeof obj === 'object' && '__brand__' in obj && obj.__brand__ === 'IMessageObject';
}
