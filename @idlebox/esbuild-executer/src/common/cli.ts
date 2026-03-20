import debug from 'debug';
import inspector from 'node:inspector';
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

function isInspectArg(arg: string) {
	for (const inspectArg of ['--inspect', '--inspect-brk', '--inspect-port', '--inspect-wait']) {
		if (arg === inspectArg) {
			return true;
		}
		if (arg.startsWith(`${inspectArg}=`)) {
			return true;
		}
	}
	return false;
}

const hasInspect = process.env.INSPECTOR_MODE || inspector.url() || process.execArgv.some(isInspectArg);
export const inspectEnabled = !!hasInspect;
