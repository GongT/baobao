import { createLogger, type IMyLogger } from '@idlebox/logger';
import type { InspectOptions } from 'node:util';
import type TypeScriptApi from 'typescript';

export const consoleLogger: IMyLogger = createLogger('typescript-surface-analyzer');

export function showFile(node: TypeScriptApi.Node) {
	const file = node.getSourceFile();
	return `(at: ${file.fileName}:${file.getLineAndCharacterOfPosition(node.getStart()).line})`;
}

const colors = {
	red: '38;5;1',
	green: '38;5;2',
	yellow: '38;5;3',
	blue: '38;5;4',
	gay: '38;5;5',
};
function drawNoop(t: string) {
	return t;
}
function drawColor(c: string, t: string) {
	return `\x1B[${c}m${t}\x1B[0m`;
}
export function createColor(ins: InspectOptions): Record<keyof typeof colors, (txt: string) => string> {
	if (ins.colors) {
	}
	const ret: any = {};
	for (const [name, color] of Object.entries<string>(colors)) {
		ret[name] = ins.colors ? drawColor.bind(undefined, color) : drawNoop;
	}
	return ret;
}

export function createInspectTab(depth: number, inspectOptions: InspectOptions) {
	if (!inspectOptions.depth) {
		return '';
	}
	return '  '.repeat(Math.abs(inspectOptions.depth || 0 - depth));
}

export class MyError extends Error {}
