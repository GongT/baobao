import ts from 'typescript';
import { format } from 'util';
import { relativePath } from '@idlebox/node';

export function formatMyDiagnostic(node: ts.Node, message: string, ...args: any[]) {
	const pos = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
	return format(
		'%s(%s,%s): ' + message,
		relativePath(process.cwd(), node.getSourceFile().fileName),
		pos.line + 1,
		pos.character,
		...args
	);
}

export function printMyDiagnostic(node: ts.Node, message: string, ...args: any[]) {
	console.error(formatMyDiagnostic(node, message, ...args));
}
