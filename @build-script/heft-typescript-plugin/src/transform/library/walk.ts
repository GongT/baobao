import type { IScopedLogger } from '@rushstack/heft';
import type TypeScriptApi from 'typescript';

export type NodeWalker = (node: TypeScriptApi.Node) => TypeScriptApi.Node | TypeScriptApi.Node[] | undefined;

export function TopLevelWalker(
	ts: typeof TypeScriptApi,
	context: TypeScriptApi.TransformationContext,
	terminal: IScopedLogger['terminal'],
	callback: NodeWalker
) {
	return (sourceFile: TypeScriptApi.SourceFile) => {
		// console.log('transform', sourceFile.fileName);
		terminal.writeVerboseLine(`> walk file: ${sourceFile.fileName}`);
		return ts.visitEachChild(sourceFile, callback, context);
	};
}

export function EmptyWalker(terminal: IScopedLogger['terminal']) {
	return (sourceFile: TypeScriptApi.SourceFile) => {
		// console.log('transform', sourceFile.fileName);
		terminal.writeVerboseLine(`> walk file: ${sourceFile.fileName}`);
		return sourceFile;
	};
}
