import type TypeScriptApi from 'typescript';
import type { IScopedLogger } from '@rushstack/heft';
import { inspect } from 'util';
import { isAstNode, linkParentNode } from './util';

export interface IReplacerContext {
	readonly host: TypeScriptApi.CompilerHost;
	readonly context: TypeScriptApi.TransformationContext;
	readonly logger: IScopedLogger;
	readonly ts: typeof TypeScriptApi;
}

export abstract class NodeReplacer<T extends TypeScriptApi.Node, RT = TypeScriptApi.Node> {
	public abstract readonly kinds: ReadonlyArray<TypeScriptApi.SyntaxKind>;
	protected abstract _check(node: TypeScriptApi.Node): boolean;
	protected abstract _replace(node: T): RT | undefined | void;
	protected declare readonly context: IReplacerContext;

	constructor() {
		if (this.replace !== NodeReplacer.prototype.replace) {
			throw new TypeError('can not override final method NodeReplacer::replace()');
		}
	}

	attach(context: IReplacerContext) {
		if (this.context) throw new Error('invalid state');
		Object.assign(context, {
			[inspect.custom]() {
				return `context<${!!context.host}, ${!!context.context}, ${!!context.logger}, ${!!context.ts}>`;
			},
		});
		Object.defineProperty(this, 'context', {
			enumerable: true,
			value: context,
			writable: false,
			configurable: false,
		});
	}

	public check(node: TypeScriptApi.Node): node is T {
		return this._check(node);
	}

	public replace(node: T): RT | undefined | void {
		const { ts, logger } = this.context;

		const result = this._replace(node);
		if (!result) return result;

		if (isAstNode(ts, result)) {
			linkParentNode(ts, result, node);
			return result;
		} else if (Array.isArray(result) && (result.length === 0 || isAstNode(ts, result[0]))) {
			for (const element of result) {
				linkParentNode(ts, element, node);
			}
		} else {
			logger.emitWarning(new Error('[transform/replacer] unknown return value from replace() method'));
		}

		return result;
	}
}

export class ReplacementSet {
	private readonly list: NodeReplacer<TypeScriptApi.Node, TypeScriptApi.Node>[] = [];
	constructor(
		protected readonly ts: typeof TypeScriptApi,
		protected readonly context: TypeScriptApi.TransformationContext,
		protected readonly host: TypeScriptApi.CompilerHost,
		protected readonly logger: IScopedLogger
	) {
		this.execute = this.execute.bind(this);
		this.push = this.push.bind(this);
	}

	execute(node: TypeScriptApi.Node): TypeScriptApi.Node {
		// this.logger.debug('ReplacementSet:');
		for (const item of this.list) {
			// this.logger.debug('  - %s', item.constructor.name);
			if (item.check(node)) {
				const newNode = item.replace(node);
				if (newNode) node = newNode;
			}
		}
		return node;
	}

	push(replacer: NodeReplacer<TypeScriptApi.Node, TypeScriptApi.Node>) {
		replacer.attach({ logger: this.logger, ts: this.ts, context: this.context, host: this.host });
		this.list.push(replacer);
	}

	register() {
		const uniq = new Set<TypeScriptApi.SyntaxKind>();
		for (const replacer of this.list) {
			for (const kind of replacer.kinds) {
				uniq.add(kind);
			}
		}
		for (const k of uniq.values()) {
			this.context.enableSubstitution(k);
		}
		this.context.onSubstituteNode = (_hint, node) => {
			return this.execute(node);
		};
	}
}
