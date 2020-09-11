import { isExportDeclaration, isImportDeclaration, isStringLiteral, Node } from 'typescript';
import { ValidImportOrExportDeclaration } from './types';

export function isImportExport(node: Node): node is ValidImportOrExportDeclaration {
	if (!isImportDeclaration(node) && !isExportDeclaration(node)) return false;
	if (node.moduleSpecifier === undefined) return false;
	// only when module specifier is valid
	if (!isStringLiteral(node.moduleSpecifier)) return false;
	return true;
}
