import * as ts from 'typescript';
import { ValidExportDeclaration, ValidImportDeclaration, ValidImportOrExportDeclaration } from './types';

export function isImportExport(node: ts.Node): node is ValidImportOrExportDeclaration {
	if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) return false;
	if (node.moduleSpecifier === undefined) return false;
	// only when module specifier is valid
	if (!ts.isStringLiteral(node.moduleSpecifier)) return false;
	return true;
}

export function isImport(node: ts.Node): node is ValidImportDeclaration {
	if (!ts.isImportDeclaration(node)) return false;
	if (node.moduleSpecifier === undefined) return false;
	// only when module specifier is valid
	if (!ts.isStringLiteral(node.moduleSpecifier)) return false;
	return true;
}

export function isExport(node: ts.Node): node is ValidExportDeclaration {
	if (!ts.isExportDeclaration(node)) return false;
	if (node.moduleSpecifier === undefined) return false;
	// only when module specifier is valid
	if (!ts.isStringLiteral(node.moduleSpecifier)) return false;
	return true;
}

export function getAllImports(sourceFile: ts.SourceFile): ValidImportDeclaration[] {
	return sourceFile.forEachChild<ValidImportDeclaration[]>(
		() => {
			return undefined;
		},
		(nodes) => {
			return nodes.filter((node) => {
				return isImport(node);
			}) as ValidImportDeclaration[];
		}
	)!;
}
