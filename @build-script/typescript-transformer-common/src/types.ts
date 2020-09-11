import { extname } from 'path';
import { ExportDeclaration, ImportDeclaration, StringLiteral } from 'typescript';

export type ValidImportOrExportDeclaration = (ImportDeclaration | ExportDeclaration) & {
	moduleSpecifier: StringLiteral;
};

export function extensionIsKindOfScriptFile(f: string) {
	const e = extname(f).toLowerCase();
	return e === '.js' || e === '.jsx' || e === '.ts' || e === '.tsx' || e === '.cjs' || e === '.mjs';
}
