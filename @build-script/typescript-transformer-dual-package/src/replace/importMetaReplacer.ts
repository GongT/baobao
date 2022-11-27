import { IDebug, NodeReplacer } from '@build-script/typescript-transformer-common';
import ts from 'typescript';

type IReplacer = (
	key: string,
	node: ts.PropertyAccessExpression,
	context: ts.TransformationContext,
	logger: IDebug
) => ts.Node | undefined;

export class ImportMetaReplacer extends NodeReplacer<ts.PropertyAccessExpression> {
	public readonly kinds = [ts.SyntaxKind.PropertyAccessExpression];

	constructor(private readonly replacer: IReplacer) {
		super();
	}

	override _check(node: ts.Node) {
		const r =
			ts.isPropertyAccessExpression(node) &&
			ts.isMetaProperty(node.expression) &&
			ts.idText(node.expression.name) === 'meta';
		// this.logger?.debug('[replacer/import]', ts.SyntaxKind[node.kind], node.getText(), r);
		return r;
	}

	override _replace(node: ts.PropertyAccessExpression, context: ts.TransformationContext): ts.Node | undefined {
		this.logger.debug('replace meta var:', node.name);
		return this.replacer(ts.idText(node.name), node, context, this.logger);
	}

	static UrlToFilename(key: string, _: ts.Node, { factory }: ts.TransformationContext): ts.Node | undefined {
		if (key !== 'url') {
			return;
		}
		return factory.createParenthesizedExpression(
			factory.createBinaryExpression(
				factory.createStringLiteral('file://'),
				ts.SyntaxKind.PlusToken,
				factory.createIdentifier('__filename')
			)
		);
	}
}
