import { relative } from 'node:path';
import type TypeScriptApi from 'typescript';

export class ApiHost {
	constructor(public readonly ts: typeof TypeScriptApi) {}

	static relativePosix(from: string, to: string): string {
		return relative(from, to).replace(/\\/g, '/');
	}

	isTagMatch(node: TypeScriptApi.Node, tags: readonly string[]) {
		for (const item of this.ts.getJSDocTags(node)) {
			if (item.tagName) {
				const n = ApiHost.idToString(item.tagName).toLowerCase();
				if (tags.includes(n)) {
					return n;
				}
			}
		}
		return undefined;
	}

	static idToString(id: TypeScriptApi.Identifier | TypeScriptApi.ModuleExportName) {
		const i = id as any;
		return i.escapedText?.toString() ?? id.text;
	}

	idToString(id: TypeScriptApi.Identifier) {
		return id.escapedText.toString();
	}

	nameToString(name: TypeScriptApi.Identifier | TypeScriptApi.StringLiteral | TypeScriptApi.ModuleExportName) {
		if (this.ts.isIdentifier(name)) {
			return name.escapedText.toString();
		}
		return name.text;
	}

	isExported(n: TypeScriptApi.Node) {
		const node = n as TypeScriptApi.ExportDeclaration;
		if (!node.modifiers) {
			return false; // no any modify
		}
		return node.modifiers.findIndex((e) => e.kind === this.ts.SyntaxKind.ExportKeyword) !== -1;
	}

	isDefaultExport(n: TypeScriptApi.Node) {
		const node = n as TypeScriptApi.ExportDeclaration;
		if (!node.modifiers) {
			return false; // no any modify
		}
		return node.modifiers.findIndex((e) => e.kind === this.ts.SyntaxKind.DefaultKeyword) !== -1;
	}

	findingBindingType(node: TypeScriptApi.BindingName): TypeScriptApi.Identifier[] {
		const ret: TypeScriptApi.Identifier[] = [];
		if (this.ts.isObjectBindingPattern(node)) {
			for (const element of node.elements) {
				ret.push(...this.findingBindingType(element.name));
			}
		} else if (this.ts.isArrayBindingPattern(node)) {
			for (const element of node.elements) {
				if (!this.ts.isOmittedExpression(element)) {
					ret.push(...this.findingBindingType(element.name));
				}
			}
		} else if (this.ts.isIdentifier(node)) {
			ret.push(node);
		}
		return ret;
	}
}
