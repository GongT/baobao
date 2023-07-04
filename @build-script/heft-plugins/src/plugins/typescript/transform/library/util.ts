import { format } from 'util';
import { relativePath } from '../../../../misc/functions';

import type TypeScriptApi from 'typescript';
export function formatMyDiagnostic(node: TypeScriptApi.Node, message: string, ...args: any[]) {
	if (node.getSourceFile()) {
		const pos = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
		return format(
			'%s(%s,%s): ' + message,
			relativePath(process.cwd(), node.getSourceFile().fileName),
			pos.line + 1,
			pos.character,
			...args
		);
	} else {
		return format('(%s failed get position) ' + message, node, ...args);
	}
}

export function idToString(id: TypeScriptApi.Identifier) {
	return id.escapedText.toString();
}

export function nameToString(ts: typeof TypeScriptApi, name: TypeScriptApi.Identifier | TypeScriptApi.StringLiteral) {
	if (ts.isStringLiteral(name)) {
		return name.text;
	} else {
		return name.escapedText.toString();
	}
}
type valid = {
	moduleSpecifier: TypeScriptApi.StringLiteral;
};
type ValidImportDeclaration = TypeScriptApi.ImportDeclaration & valid;
type ValidExportFromDeclaration = TypeScriptApi.ExportDeclaration & valid;
export type ValidImportOrExportFromDeclaration = ValidImportDeclaration | ValidExportFromDeclaration;

export function isImportExportFrom(
	ts: typeof TypeScriptApi,
	node: TypeScriptApi.Node
): node is ValidImportOrExportFromDeclaration {
	if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) {
		// not "import .. from" or "export .. from"
		return false;
	}
	const moduleSpecifier: TypeScriptApi.StringLiteral = node.moduleSpecifier as any;
	if (!moduleSpecifier) {
		// simple "export xxx" (not from)
		return false;
	}

	if (!(moduleSpecifier.kind === ts.SyntaxKind.StringLiteral || ts.isStringLiteral(moduleSpecifier))) {
		throw new SyntaxError(formatMyDiagnostic(node, 'invalid import/export moduleSpecifier'));
	}
	return true;
}

export function isEsModule(ts: typeof TypeScriptApi, module?: TypeScriptApi.ModuleKind) {
	const mdl = module as number;

	return mdl >= ts.ModuleKind.ES2015 && mdl <= ts.ModuleKind.ESNext;
}

export function tryGetSourceFile(
	ts: typeof TypeScriptApi,
	node: TypeScriptApi.Node
): TypeScriptApi.SourceFile | undefined {
	if (ts.isSourceFile(node)) {
		return node;
	}

	if (node.parent) {
		const r = tryGetSourceFile(ts, node.parent);
		if (r) {
			return r;
		}
	}

	const original = ts.getOriginalNode(node);
	if (original && node !== original) {
		const r = tryGetSourceFile(ts, original);
		if (r) {
			return r;
		}
	}

	return undefined;
}

export function isAstNode(ts: typeof TypeScriptApi, node: any): node is TypeScriptApi.Node {
	if (node && node.kind >= ts.SyntaxKind.FirstNode) {
		return true;
	}
	return false;
}

export function linkParentNode(ts: typeof TypeScriptApi, element: TypeScriptApi.Node, parent: TypeScriptApi.Node) {
	if (!parent) return;

	if (!element.parent) {
		const original = ts.getOriginalNode(parent);
		if (original && original !== parent) {
			parent = original;
		}

		Object.assign(element, { parent: parent.parent });
	}
}
