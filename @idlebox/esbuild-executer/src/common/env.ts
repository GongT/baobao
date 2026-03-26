import debug from 'debug';
import { DebugMessageKind } from './message.types.js';

export const enables: Record<DebugMessageKind, boolean> = {
	[DebugMessageKind.import]: debug.enabled('executer:import'),
	[DebugMessageKind.esbuild]: debug.enabled('executer:esbuild'),
	[DebugMessageKind.worker]: debug.enabled('executer:worker'),
	[DebugMessageKind.resolve]: debug.enabled('executer:resolve'),
	[DebugMessageKind.output]: true,
	[DebugMessageKind.error]: true,
};
