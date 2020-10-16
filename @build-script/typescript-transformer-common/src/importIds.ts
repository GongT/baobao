import * as ts from 'typescript';
import { ValidImportDeclaration, ValidImportOrExportDeclaration } from './types';
import { nameToString } from './util';

export interface IImportNames {
	types: string[];
	values: string[];
}

interface IMiddleValue {
	identifier: ts.Identifier;
	name: string;
}

function listNamesOfImportLine(node: ValidImportDeclaration): IMiddleValue[] {
	const ret: IMiddleValue[] = [];
	const { importClause } = node;
	if (!importClause) {
		return ret;
	}

	if (importClause.name) {
		// import def from
		ret.push({ identifier: importClause.name, name: 'default' });
	}
	if (importClause.namedBindings) {
		const { namedBindings } = importClause;
		if (ts.isNamedImports(namedBindings)) {
			// import {a as b, c} from
			for (const item of namedBindings.elements) {
				const id = item.propertyName || item.name;
				ret.push({ identifier: id, name: nameToString(id) });
			}
		} else if (ts.isNamespaceImport(namedBindings)) {
			// import * as all from
			ret.push({ identifier: namedBindings.name, name: '*' });
		}
	}
	return ret;
}

export function collectImportInfo(
	sourceFile: ts.SourceFile,
	nodes: ValidImportDeclaration[],
	typeChecker: ts.TypeChecker
): IImportNames {
	const ret: IImportNames = {
		types: [],
		values: [],
	};

	// console.log('='.repeat(process.stderr.columns) + '\n', sourceFile.fileName);
	const symbolsNeedCheck = new Map<ts.Type, IMiddleValue>();

	for (const node of nodes) {
		for (const value of listNamesOfImportLine(node)) {
			const type = typeChecker.getTypeAtLocation(value.identifier);
			if (type.getSymbol()) {
				symbolsNeedCheck.set(type, value);
			} else {
				ret.types.push(value.name);
			}
		}
	}

	// for (const [_, symbolIdentifier] of symbolsNeedCheck.entries()) {
	// 	dumpNode(symbolIdentifier);
	// }
	ts.forEachChild(sourceFile, function tokenWalk(node: ts.Node) {
		if (ts.isImportDeclaration(node)) {
			return;
		}
		if (ts.isTypeQueryNode(node)) {
			// console.error('[SKIP]', ts.SyntaxKind[node.kind], node.getText());
			return;
		}
		if (ts.isVariableDeclaration(node)) {
			if (node.initializer) tokenWalk(node.initializer);
			return;
		}
		if (ts.isIdentifier(node)) {
			// console.error('[%s]', ts.SyntaxKind[node.kind], node.getText());
			const symbol = typeChecker.getSymbolAtLocation(node);
			if (symbol) {
				const type = typeChecker.getTypeAtLocation(node);

				const importedSymbol = symbolsNeedCheck.get(type);
				if (importedSymbol) {
					symbolsNeedCheck.delete(type);

					// console.log('!!!!', nameToString(importedSymbol), typeChecker.getFullyQualifiedName(symbol));
					ret.values.push(importedSymbol.name);
				}
			}
			return;
		}
		ts.forEachChild(node, tokenWalk);
	});

	for (const { name } of symbolsNeedCheck.values()) {
		ret.types.push(name);
	}

	return ret;
}

/** @deprecated */
export function collectImportNames(node: ValidImportOrExportDeclaration): string[] {
	const ret: string[] = [];
	if (ts.isImportDeclaration(node)) {
		const { importClause } = node;
		if (!importClause) {
			return ret;
		}

		if (importClause.name) {
			// import def from
			ret.push('default');
		}
		if (importClause.namedBindings) {
			const { namedBindings } = importClause;
			if (ts.isNamedImports(namedBindings)) {
				// import {a as b, c} from
				ret.push(...getAllNames(namedBindings.elements));
			} else if (ts.isNamespaceImport(namedBindings)) {
				// import * as all from
				ret.unshift('*');
			}
		}
	} else if (ts.isExportDeclaration(node)) {
		const { exportClause } = node;

		if (!exportClause) {
			// export * from
			return ['*'];
		}
		if (ts.isNamedExports(exportClause)) {
			// export {a as b, c} from
			ret.push(...getAllNames(exportClause.elements));
		}
	}
	return ret;
}

function getAllNames(list: ts.NodeArray<ts.ImportSpecifier | ts.ExportSpecifier>): string[] {
	return list.map((v) => nameToString(v.propertyName || v.name));
}
