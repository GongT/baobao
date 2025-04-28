import type { MessagePort } from 'node:worker_threads';

export interface IOptions {
	/** when string, use minimatch */
	exclude?: RegExp | string[];
}

export interface IPassing {
	options: IOptions;
	channel: MessagePort;
}

export type ILoadEvent = IFileChangeEvent;

export interface IFileChangeEvent {
	kind: 'change';
	path: string;
}
