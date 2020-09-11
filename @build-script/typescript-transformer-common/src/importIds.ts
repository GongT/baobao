import {
	ExportSpecifier,
	Identifier,
	ImportSpecifier,
	isExportDeclaration,
	isImportDeclaration,
	isNamedExports,
	isNamedImports,
	isNamespaceImport,
	NodeArray,
	StringLiteral,
} from 'typescript';
import { ValidImportOrExportDeclaration } from './types';

export function collectImportNames(node: ValidImportOrExportDeclaration): string[] {
	if (isImportDeclaration(node)) {
		if (!node.importClause) {
			return [];
		}

		const { importClause } = node;
		if (importClause.name) {
			// import def from
			return ['default'];
		}
		if (importClause.namedBindings) {
			const { namedBindings } = importClause;
			if (isNamedImports(namedBindings)) {
				// import {a as b, c} from
				return getAllNames(namedBindings.elements);
			} else if (isNamespaceImport(namedBindings)) {
				// import * as all from
				return ['*'];
			}
		}
	} else if (isExportDeclaration(node)) {
		if (!node.exportClause) {
			// export * from
			return ['*'];
		}
		const { exportClause } = node;

		if (isNamedExports(exportClause)) {
			// export {a as b, c} from
			return getAllNames(exportClause.elements);
		}
	}
	return ['__failed_parse__'];
}

function getString(v: Identifier | StringLiteral) {
	return v.getText();
}

function getAllNames(list: NodeArray<ImportSpecifier | ExportSpecifier>): string[] {
	return list.map((v) => getString(v.propertyName || v.name));
}
