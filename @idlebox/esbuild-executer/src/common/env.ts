import debug from 'debug';
import { DebugMessageKind } from './message.types.js';

export const enables: Record<DebugMessageKind, boolean> = {
	[DebugMessageKind.hook]: debug.enabled('executer:import'),
	[DebugMessageKind.esbuild]: debug.enabled('executer:esbuild'),
	[DebugMessageKind.worker]: debug.enabled('executer:worker'),
	[DebugMessageKind.resolve]: debug.enabled('executer:resolve'),
	[DebugMessageKind.verbose]: debug.enabled('executer:verbose'),
	[DebugMessageKind.output]: true,
	[DebugMessageKind.error]: true,
};
