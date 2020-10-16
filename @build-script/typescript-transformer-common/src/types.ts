import { extname } from 'path';
import { ExportDeclaration, ImportDeclaration, StringLiteral } from 'typescript';

type valid = {
	moduleSpecifier: StringLiteral;
};
export type ValidImportDeclaration = ImportDeclaration & valid;
export type ValidExportDeclaration = ExportDeclaration & valid;
export type ValidImportOrExportDeclaration = ValidImportDeclaration | ValidExportDeclaration;

export function extensionIsKindOfScriptFile(f: string) {
	const e = extname(f).toLowerCase();
	return e === '.js' || e === '.jsx' || e === '.ts' || e === '.tsx' || e === '.cjs' || e === '.mjs';
}
