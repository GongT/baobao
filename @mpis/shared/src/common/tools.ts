import type { BuildEvent, IMessageObject } from '../types.js';

export function make_message(event: BuildEvent, title: string, message: string, output?: string): IMessageObject {
	return {
		__brand__: 'BPCM' as any,
		event,
		title,
		pid: process.pid,
		message,
		output,
	};
}

export function is_message(obj: unknown): obj is IMessageObject {
	if (obj && typeof obj === 'object' && (obj as any).__brand__ === 'BPCM') {
		return true;
	}
	return false;
}
