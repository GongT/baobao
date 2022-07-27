import * as ts from 'typescript';
import { ImportIdentifierCollection } from './importIds.helper';
import { ValidImportDeclaration } from './types';

export type IImportInfoResult = Map<ValidImportDeclaration, IImportNames>;

interface IImportNames {
	types: string[];
	values: string[];
}

export function collectImportInfo(
	sourceFile: ts.SourceFile,
	nodes: ValidImportDeclaration[],
	typeChecker: ts.TypeChecker
): IImportInfoResult {
	const ret: IImportInfoResult = new Map();

	const importCollect = new ImportIdentifierCollection(typeChecker);
	for (const node of nodes) {
		importCollect.add(node);
		ret.set(node, { types: [], values: [] });
	}

	// console.log('='.repeat(process.stderr.columns) + '\n', sourceFile.fileName);
	// console.log(' : %s imports', importCollect.length);

	if (importCollect.length === 0) {
		// console.log(' ! this file no import');
		return ret;
	}

	ts.forEachChild(sourceFile, function tokenWalk(node: ts.Node): void {
		// console.error(
		// 	'[%s] %s %s',
		// 	ts.SyntaxKind[node.kind],
		// 	node.kind === ts.SyntaxKind.Identifier ? node.getText() : '',
		// 	dumpFlagStrings(node.flags, ts.NodeFlags, ' + ')
		// );

		if (ts.isImportDeclaration(node)) {
			return;
		}
		if (
			ts.isTypeAliasDeclaration(node) ||
			ts.isTypeQueryNode(node) ||
			ts.isTypeOfExpression(node) ||
			ts.isTypeReferenceNode(node)
		) {
			// 	console.error('[SKIP]', ts.SyntaxKind[node.kind], node.getText());
			return;
		}
		if (ts.isTypeNode(node)) {
			if (
				ts.isHeritageClause(node.parent) &&
				node.parent.token === ts.SyntaxKind.ExtendsKeyword &&
				node.parent.parent.kind !== ts.SyntaxKind.InterfaceDeclaration
			) {
				// dumpNode(node.parent);
				// console.error('  -> no skip parent isHeritageClause', node.getText());
			} else {
				// console.error('  -> skip isTypeNode:', ts.SyntaxKind[node.kind], node.getText());
				return;
			}
		}
		if (ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)) {
			tokenWalk(node.expression);
			return;
		}
		if (ts.isIdentifier(node)) {
			// dumpNode(node);
			const name = isImportedValue(node, importCollect, typeChecker); // || isComplexInterface(node, importCollect, typeChecker);
			if (name) {
				const info = importCollect.found(name);
				ret.get(info.node)!.values.push(info.stringifyName);
			} else {
				// console.error('    -> %s: not imported value', node.text);
			}
			return;
		}
		ts.forEachChild(node, tokenWalk);
	});

	for (const info of importCollect.listNotFound()) {
		// console.log('!!!! %s is never use as value, so is a type', info.stringifyName);
		ret.get(info.node)!.types.push(info.stringifyName);
	}

	return ret;
}

function isImportedValue(node: ts.Identifier, collect: ImportIdentifierCollection, checker: ts.TypeChecker) {
	const symbol = checker.getSymbolAtLocation(node);
	if (!symbol) {
		// printMyDiagnostic(node, 'identifier "%s" has no symbol', node.getText());
		return;
	}
	const decla = symbol.getDeclarations();
	if (!decla || decla.length === 0) {
		return undefined;
	}
	for (const item of decla) {
		// console.log('  -> decl: %s (%s)', prettyKind(item), item.getText().split('\n')[0]);
		const found = collect.findDeclaration(item);
		if (found) {
			return found;
		}
	}
	return undefined;
}

/*
function isComplexInterface(node: ts.Identifier, imports: ImportIdentifierCollection, checker: ts.TypeChecker) {
	for (const item of imports) {
		if (checker.getTypeAtLocation(item.identifier) === checker.getTypeAtLocation(node)) {
			console.log('!!!! %s used as %s, is a value', item.name, node.getText());
			return item.name;
		}
	}
	return undefined;
}
*/
