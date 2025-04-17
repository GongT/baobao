import type { IScopedLogger } from '@rushstack/heft';
import { NodeReplacer } from '../library/NodeReplacer.js';
import { isImportExportFrom, linkParentNode, ValidImportOrExportFromDeclaration } from '../library/util.js';

import type TypeScriptApi from 'typescript';
type IReplacer = (
	old: string,
	node: TypeScriptApi.Node,
	context: TypeScriptApi.TransformationContext,
	logger: IScopedLogger
) => string;

export class ImportExportSpecifierReplacer extends NodeReplacer<ValidImportOrExportFromDeclaration> {
	public get kinds() {
		const { ts } = this.context;
		return [ts.SyntaxKind.ImportDeclaration, ts.SyntaxKind.ExportDeclaration, ts.SyntaxKind.CallExpression];
	}

	constructor(private readonly replacer: IReplacer) {
		super();
	}

	override _check(node: TypeScriptApi.Node) {
		const { ts, logger } = this.context;
		// logger.debug('[replacer/re-export]', TypeScriptApi.SyntaxKind[node.kind], node.getText());
		try {
			if (!isImportExportFrom(ts, node)) {
				// logger.terminal.writeVerboseLine('             export from');
				if (ts.isCallExpression(node)) {
					if (node.parent && !ts.isSourceFile(node.parent)) {
						return false;
					}
					if (ts.isIdentifier(node.expression)) {
						if (
							node.expression.escapedText === 'require' &&
							node.arguments.length === 1 &&
							ts.isStringLiteral(node.arguments[0]!)
						) {
							return true;
						}
					}
				}
				return false;
			}
		} catch (e: any) {
			logger.terminal.writeErrorLine('[replacer] failed:' + e.message);
			return false;
		}

		return true;
	}

	private createString(node: ValidImportOrExportFromDeclaration) {
		const { logger, context } = this.context;

		const str = this.replacer(node.moduleSpecifier.text, node, context, logger);
		if (node.moduleSpecifier.text === str) {
			return undefined;
		}

		return context.factory.createStringLiteral(str);
	}

	override _replace(
		node: ValidImportOrExportFromDeclaration | TypeScriptApi.CallExpression
	): TypeScriptApi.ImportDeclaration | TypeScriptApi.ExportDeclaration | TypeScriptApi.CallExpression {
		const { ts, logger, context } = this.context;

		// logger.terminal.writeVerboseLine(' * ' + (node as any).moduleSpecifier?.text);
		if (ts.isImportDeclaration(node)) {
			const moduleSpecifier = this.createString(node);
			if (!moduleSpecifier) return node;
			return context.factory.updateImportDeclaration(
				node,
				node.modifiers,
				node.importClause,
				moduleSpecifier,
				node.assertClause
			);
		} else if (ts.isExportDeclaration(node)) {
			const moduleSpecifier = this.createString(node);
			if (!moduleSpecifier) return node;
			return context.factory.updateExportDeclaration(
				node,
				node.modifiers,
				node.isTypeOnly,
				node.exportClause,
				moduleSpecifier,
				node.assertClause
			);
		} else {
			// require("xxx")
			const sl = node.arguments[0] as TypeScriptApi.StringLiteral;
			linkParentNode(ts, node, ts.getOriginalNode(sl).parent);

			const str = this.replacer(sl.text, node, context, logger);
			if (sl.text === str) {
				return node;
			}
			const newStr = context.factory.createStringLiteral(str);
			ts.setOriginalNode(newStr, ts.getOriginalNode(sl));

			return context.factory.updateCallExpression(node, node.expression, node.typeArguments, [newStr]);
		}
	}
}
