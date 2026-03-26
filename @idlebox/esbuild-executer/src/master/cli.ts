import { hasInspector } from '@idlebox/node';
import debug from 'debug';
import { DebugMessageKind } from '../common/message.types.js';

export function isTrue(key: string) {
	const value = process.env[key];
	return value === 'true' || value === '1' || value === 'yes';
}

type SimpleOutput = (message: string) => void;
export function createMaster(): Record<DebugMessageKind, SimpleOutput> & {
	master: debug.Debugger;
} {
	return {
		[DebugMessageKind.import]: debug('executer:import'),
		[DebugMessageKind.esbuild]: debug('executer:esbuild'),
		[DebugMessageKind.worker]: debug('executer:worker'),
		[DebugMessageKind.resolve]: debug('executer:resolve'),
		[DebugMessageKind.output]: console.error,
		[DebugMessageKind.error]: console.error,
		master: debug('executer:master'),
	};
}

if (!process.env.__INSPECTOR_MODE && hasInspector()) {
	process.env.__INSPECTOR_MODE = 'yes';
}
export const inspectEnabled = !!process.env.__INSPECTOR_MODE;
