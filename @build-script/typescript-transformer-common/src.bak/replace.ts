import { factory, setOriginalNode } from 'typescript';
import { ValidImportOrExportDeclaration } from './types';

/**
 * Replace specifier part of a import/export statement
 *
 * import x from "--> SPECIFIER <--"
 */
export function replaceImportExportSpecifier(
	node: ValidImportOrExportDeclaration,
	newSpecifier: string
): ValidImportOrExportDeclaration {
	const modified: ValidImportOrExportDeclaration = Object.create(node);
	Object.assign(modified, {
		moduleSpecifier: factory.createStringLiteral(newSpecifier),
	});
	setOriginalNode(modified, node);
	Object.assign(modified.moduleSpecifier, {
		parent: node,
	});
	return modified;
}
