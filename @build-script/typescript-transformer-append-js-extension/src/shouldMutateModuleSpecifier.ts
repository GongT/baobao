import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import {
	SyntaxKind,
	ExportDeclaration,
	ImportDeclaration,
	isExportDeclaration,
	isImportDeclaration,
	isStringLiteral,
	Node,
	Program,
	StringLiteral,
} from 'typescript';
import { IDebug } from './debug';

export type ValidImportOrExportDeclaration = (ImportDeclaration | ExportDeclaration) & {
	moduleSpecifier: StringLiteral;
};

export function shouldMutateModuleSpecifier(
	source: string,
	node: Node,
	debug: IDebug,
	program?: Program
): node is ValidImportOrExportDeclaration {
	if (!isImportDeclaration(node) && !isExportDeclaration(node)) {
		// not "import .. from" or "export .. from"
		return false;
	}
	const moduleSpecifier: StringLiteral = node.moduleSpecifier as any;
	if (!moduleSpecifier || !(moduleSpecifier.kind === SyntaxKind.StringLiteral || isStringLiteral(moduleSpecifier))) {
		debug('  ! syntax error: ', node.getText());
		return false;
	}
	if (moduleSpecifier.text.startsWith('./') || moduleSpecifier.text.startsWith('../')) {
		const dir = dirname(source);
		for (const ext of ['.ts', '.tsx']) {
			const fp = resolve(dir, moduleSpecifier.text + ext);
			if (program) {
				if (program.getSourceFile(fp)) {
					return true;
				} else {
					debug('  ! imported file <%s> not in program');
				}
			} else {
				if (existsSync(fp)) {
					return true;
				} else {
					debug('  ! imported file <%s> not exists');
				}
			}
		}
		debug(' ??? ', dir, moduleSpecifier.text);
		return false;
	} else {
		// TODO: handle paths mapping (absolute to tsconfig.json)
		debug('absolute import: %s', node.moduleSpecifier?.getText());
		return false;
	}
}
