import debug from 'debug';
import type { IDebugMessage } from './message.types.js';

export function isTrue(key: string) {
	const value = process.env[key];
	return value === 'true' || value === '1' || value === 'yes';
}

const output = debug('executer:output');
output.enabled = true;

export const debugs = {
	import: debug('executer:import'),
	esbuild: debug('executer:esbuild'),
	worker: debug('executer:worker'),
	resolve: debug('executer:resolve'),
	output: output,
	master: debug('executer:master'),
} satisfies Record<IDebugMessage['kind'] | 'master', debug.Debugger>;

export const inspectEnabled = process.execArgv.some((e) => e.startsWith('--inspect'));
