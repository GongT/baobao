import { hasInspector } from '@idlebox/node';
import debug from 'debug';
import assert from 'node:assert';
import { isMainThread } from 'node:worker_threads';
import { DebugMessageKind } from '../common/message.types.js';

assert.equal(isMainThread, true, 'Worker引用了主线程代码');

export function isTrue(key: string) {
	const value = process.env[key];
	return value === 'true' || value === '1' || value === 'yes';
}

type SimpleOutput = (message: string) => void;
export function createMaster(): Record<DebugMessageKind, SimpleOutput> {
	const r = {
		[DebugMessageKind.hook]: debug('executer:import'),
		[DebugMessageKind.esbuild]: debug('executer:esbuild'),
		[DebugMessageKind.worker]: debug('executer:worker'),
		[DebugMessageKind.resolve]: debug('executer:resolve'),
		[DebugMessageKind.output]: debug('executer'),
		[DebugMessageKind.error]: debug('executer:error'),
		[DebugMessageKind.verbose]: debug('executer:verbose'),
	};

	r.error.enabled = true;

	return r;
}

if (!process.env.__INSPECTOR_MODE && hasInspector()) {
	process.env.__INSPECTOR_MODE = 'yes';
}
export const inspectEnabled = !!process.env.__INSPECTOR_MODE;
export const debugOutpus = createMaster();
export function masterOutput(tag: string) {
	if (tag) {
		return debug(`executer:master:${tag}`);
	} else {
		return debug('executer:master');
	}
}
