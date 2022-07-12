import { relative } from 'path';
import ts from 'typescript';

export function relativePosix(from: string, to: string): string {
	return relative(from, to).replace(/\\/g, '/');
}

export function isTagInternal(node: ts.Node) {
	for (const item of ts.getJSDocTags(node)) {
		if (item.tagName) {
			const n = idToString(item.tagName).toLowerCase();
			if (n === 'internal') {
				return false;
			}
		}
	}
	return true;
}

export function idToString(id: ts.Identifier) {
	return id.escapedText.toString();
}

export function nameToString(name: ts.Identifier | ts.StringLiteral) {
	if (ts.isStringLiteral(name)) {
		return name.text;
	} else {
		return name.escapedText.toString();
	}
}

export function isExported(node: ts.Node) {
	if (!node.modifiers) {
		return false; // no any modify
	}
	return node.modifiers.findIndex((e) => e.kind === ts.SyntaxKind.ExportKeyword) !== -1;
}

export function isDefaultExport(node: ts.Node) {
	if (!node.modifiers) {
		return false; // no any modify
	}
	return node.modifiers.findIndex((e) => e.kind === ts.SyntaxKind.DefaultKeyword) !== -1;
}

export function findingBindingType(node: ts.BindingName): ts.Identifier[] {
	const ret: ts.Identifier[] = [];
	if (ts.isObjectBindingPattern(node)) {
		for (const element of node.elements) {
			ret.push(...findingBindingType(element.name));
		}
	} else if (ts.isArrayBindingPattern(node)) {
		for (const element of node.elements) {
			if (!ts.isOmittedExpression(element)) {
				ret.push(...findingBindingType(element.name));
			}
		}
	} else if (ts.isIdentifier(node)) {
		ret.push(node);
	}
	return ret;
}
