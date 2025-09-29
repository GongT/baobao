import type { Node } from 'ts-morph';

export function fatal(node: Node, message: string): never {
	const sourceFile = node.getSourceFile();
	const { line, column } = sourceFile.getLineAndColumnAtPos(node.getPos());
	throw new Error(`${sourceFile.getFilePath()}:${line}:${column} - ${message}`);
}
