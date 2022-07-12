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

const allExtension = /\.[cm]?js$/i;

export function shouldMutateModuleSpecifier(
	source: string,
	node: Node,
	{ debug, error }: IDebug,
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
		const cachedObjectName = moduleSpecifier.text.replace(allExtension, '');
		for (const ms of [moduleSpecifier.text, cachedObjectName]) {
			for (const ext of ['.ts', '.tsx']) {
				const fp = resolve(dir, ms + ext);
				if (program) {
					if (program.getSourceFile(fp)) {
						moduleSpecifier.text = ms;
						return true;
					} else {
						debug('  ! imported file <%s> not in program', fp);
					}
				} else {
					if (existsSync(fp)) {
						moduleSpecifier.text = ms;
						return true;
					} else {
						debug('  ! imported file <%s> not exists', fp);
					}
				}
			}
		}
		error(` ??? failed parse require ${dir} -> ${moduleSpecifier.text}`);
		return false;
	} else {
		// TODO: handle paths mapping (absolute to tsconfig.json)
		error(`absolute import: ${node.moduleSpecifier?.getText()}`);
		return false;
	}
}
