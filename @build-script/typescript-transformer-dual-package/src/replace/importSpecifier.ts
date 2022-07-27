import {
	IDebug,
	isImportExportFrom,
	linkParentNode,
	NodeReplacer,
	ValidImportOrExportFromDeclaration,
} from '@build-script/typescript-transformer-common';
import ts from 'typescript';

type IReplacer = (old: string, node: ts.Node, context: ts.TransformationContext, logger: IDebug) => string;

export class ImportExportSpecifierReplacer extends NodeReplacer<ValidImportOrExportFromDeclaration> {
	public readonly kinds = [
		ts.SyntaxKind.ImportDeclaration,
		ts.SyntaxKind.ExportDeclaration,
		ts.SyntaxKind.CallExpression,
	];

	constructor(private readonly replacer: IReplacer) {
		super();
	}

	override check(node: ts.Node, logger: IDebug) {
		try {
			// console.log(' ! ', ts.SyntaxKind[node.kind]);
			if (!isImportExportFrom(node)) {
				if (ts.isCallExpression(node)) {
					if (node.parent && !ts.isSourceFile(node.parent)) {
						return false;
					}
					if (ts.isIdentifier(node.expression)) {
						if (
							node.expression.escapedText === 'require' &&
							node.arguments.length === 1 &&
							ts.isStringLiteral(node.arguments[0])
						) {
							return true;
						}
					}
				}
				return false;
			}
		} catch (e: any) {
			logger.error(e.message);
			return false;
		}

		return true;
	}

	private createString(node: ValidImportOrExportFromDeclaration, context: ts.TransformationContext) {
		const str = this.replacer(node.moduleSpecifier.text, node, context, this.logger);
		if (node.moduleSpecifier.text === str) {
			return undefined;
		}

		return context.factory.createStringLiteral(str);
	}

	override _replace(
		node: ValidImportOrExportFromDeclaration | ts.CallExpression,
		context: ts.TransformationContext
	): ts.ImportDeclaration | ts.ExportDeclaration | ts.CallExpression {
		// console.debug(' * %s', node.moduleSpecifier.text);
		if (ts.isImportDeclaration(node)) {
			const moduleSpecifier = this.createString(node, context);
			if (!moduleSpecifier) return node;
			return context.factory.updateImportDeclaration(
				node,
				node.decorators,
				node.modifiers,
				node.importClause,
				moduleSpecifier,
				node.assertClause
			);
		} else if (ts.isExportDeclaration(node)) {
			const moduleSpecifier = this.createString(node, context);
			if (!moduleSpecifier) return node;
			return context.factory.updateExportDeclaration(
				node,
				node.decorators,
				node.modifiers,
				node.isTypeOnly,
				node.exportClause,
				moduleSpecifier,
				node.assertClause
			);
		} else {
			// require("xxx")
			const sl = node.arguments[0] as ts.StringLiteral;
			linkParentNode(node, ts.getOriginalNode(sl).parent);

			const str = this.replacer(sl.text, node, context, this.logger);
			if (sl.text === str) {
				return node;
			}
			const newStr = context.factory.createStringLiteral(str);
			ts.setOriginalNode(newStr, ts.getOriginalNode(sl));

			return context.factory.updateCallExpression(node, node.expression, node.typeArguments, [newStr]);
		}
	}
}
