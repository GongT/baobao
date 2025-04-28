import { Emitter } from '@idlebox/common';
import Module from 'node:module';
import type { ILoadEvent, IOptions, IPassing } from './common/types.js';

export function install(options: IOptions) {
	const { registerHooks } = Module as any as ReleaseCandidateApi.Module;
	const { port1, port2 } = new MessageChannel();

	port1.on('message', (msg: ILoadEvent) => {
		console.log(msg);
	});
	port1.unref();

	Module.register(import.meta.resolve('./loader.js'), {
		parentURL: 'data:',
		data: {
			options,
			channel: port2,
		} as IPassing,
		transferList: [port2],
	});

	registerHooks({
		resolve(specifier, context, nextResolve) {
			console.log('[main] try resolve "%s"', specifier);
			return nextResolve(specifier, context);
		},
	});
}

export interface IChangeEvent {
	file: string;
}
const _onFileChange = new Emitter<IChangeEvent>();
export const onFileChange = _onFileChange.register;

export type { IOptions };
