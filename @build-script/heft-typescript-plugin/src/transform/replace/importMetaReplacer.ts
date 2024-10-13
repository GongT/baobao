import type TypeScriptApi from 'typescript';
import type { IScopedLogger } from '@rushstack/heft';
import { NodeReplacer } from '../library/NodeReplacer';

type IReplacer = (
	this: typeof TypeScriptApi,
	key: string,
	node: TypeScriptApi.PropertyAccessExpression,
	context: TypeScriptApi.TransformationContext,
	logger: IScopedLogger
) => TypeScriptApi.Node | undefined;

export class ImportMetaReplacer extends NodeReplacer<TypeScriptApi.PropertyAccessExpression> {
	public get kinds() {
		const { ts } = this.context;
		return [ts.SyntaxKind.PropertyAccessExpression];
	}

	constructor(private readonly replacer: IReplacer) {
		super();
	}

	override _check(node: TypeScriptApi.Node) {
		const { ts } = this.context;

		const r =
			ts.isPropertyAccessExpression(node) &&
			ts.isMetaProperty(node.expression) &&
			ts.idText(node.expression.name) === 'meta';
		// logger?.debug('[replacer/import]', ts.SyntaxKind[node.kind], node.getText(), r);
		return r;
	}

	override _replace(node: TypeScriptApi.PropertyAccessExpression): TypeScriptApi.Node | undefined {
		const { ts, logger, context } = this.context;

		logger.terminal.writeDebugLine('replace meta var: ' + node.name);
		return this.replacer.call(ts, ts.idText(node.name), node, context, logger);
	}

	static UrlToFilename(
		this: typeof TypeScriptApi,
		key: string,
		_: TypeScriptApi.Node,
		{ factory }: TypeScriptApi.TransformationContext
	): TypeScriptApi.Node | undefined {
		if (key !== 'url') {
			return;
		}
		return factory.createParenthesizedExpression(
			factory.createBinaryExpression(
				factory.createStringLiteral('file://'),
				this.SyntaxKind.PlusToken,
				factory.createIdentifier('__filename')
			)
		);
	}
}
