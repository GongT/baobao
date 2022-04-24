import { existsSync } from 'fs';
import { createRequire } from 'module';
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
import { builtinModules } from 'module';

export type ValidImportOrExportDeclaration = (ImportDeclaration | ExportDeclaration) & {
	moduleSpecifier: StringLiteral;
};

const cache: { [id: string]: boolean } = {};
for (const e of builtinModules) {
	cache[`"${e}"`] = false;
	cache[`'${e}'`] = false;
}
function testSpecifier(source: string, moduleSpecifier: string, debug: IDebug) {
	// TODO: handle paths mapping (absolute to tsconfig.json)
	debug('absolute import: %s', moduleSpecifier);
	try {
		const tryJs = JSON.parse(moduleSpecifier.replace(/^'|'$/g, '"')) + '.js';
		const file = createRequire(source).resolve(tryJs);
		debug('  : %s', file);
		if (file) {
			return true;
		}
	} catch (e: any) {
		debug('  ! failed require.resolve on this import: %s', e.message);
	}
	return false;
}

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
		let msp = node.moduleSpecifier?.getText();

		if (msp) {
			if (!cache.hasOwnProperty(msp)) {
				cache[msp] = testSpecifier(source, msp, debug);
			}

			return cache[msp];
		}
		return false;
	}
}
