import type TypeScriptApi from 'typescript';
import { relative } from 'path';

export class ApiHost {
	constructor(public readonly ts: typeof TypeScriptApi) {}

	static relativePosix(from: string, to: string): string {
		return relative(from, to).replace(/\\/g, '/');
	}

	isTagInternal(node: TypeScriptApi.Node) {
		for (const item of this.ts.getJSDocTags(node)) {
			if (item.tagName) {
				const n = ApiHost.idToString(item.tagName).toLowerCase();
				if (n === 'internal') {
					return false;
				}
			}
		}
		return true;
	}

	static idToString(id: TypeScriptApi.Identifier) {
		return id.escapedText.toString();
	}

	idToString(id: TypeScriptApi.Identifier) {
		return id.escapedText.toString();
	}

	nameToString(name: TypeScriptApi.Identifier | TypeScriptApi.StringLiteral) {
		if (this.ts.isStringLiteral(name)) {
			return name.text;
		} else {
			return name.escapedText.toString();
		}
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
