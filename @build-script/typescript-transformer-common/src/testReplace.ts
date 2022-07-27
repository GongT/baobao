import { bindThis } from '@idlebox/common';
import ts from 'typescript';
import { IDebug } from './logger';
import { isAstNode, linkParentNode } from './util';

export abstract class NodeReplacer<T extends ts.Node, RT = ts.Node> {
	public declare logger: IDebug;
	public abstract readonly kinds: ReadonlyArray<ts.SyntaxKind>;
	public abstract check(node: ts.Node, logger: IDebug): boolean;
	protected abstract _replace(node: T, context: ts.TransformationContext, logger: IDebug): RT | undefined | void;

	constructor() {
		if (this.replace !== NodeReplacer.prototype.replace) {
			throw new TypeError('can not override final method NodeReplacer::replace()');
		}
	}

	public replace(node: T, context: ts.TransformationContext, logger: IDebug): RT | undefined | void {
		const result = this._replace(node, context, logger);
		if (!result) return result;

		if (isAstNode(result)) {
			linkParentNode(result, node);
			return result;
		} else if (Array.isArray(result) && (result.length === 0 || isAstNode(result[0]))) {
			for (const element of result) {
				linkParentNode(element, node);
			}
		} else {
			logger.warn('[transform/replacer] unknown return value from replace() method');
		}

		return result;
	}
}

export class ReplacementSet {
	private readonly list: NodeReplacer<ts.Node, ts.Node>[] = [];
	constructor(protected readonly context: ts.TransformationContext, protected readonly logger: IDebug) {}

	@bindThis
	execute(node: ts.Node): ts.Node | ts.Node[] {
		// this.logger.debug('ReplacementSet:');
		for (const item of this.list) {
			// this.logger.debug('  - %s', item.constructor.name);
			if (item.check(node, this.logger)) {
				const newNode = item.replace(node, this.context, this.logger);
				if (newNode) node = newNode;
			}
		}
		return node;
	}

	@bindThis
	push(replacer: NodeReplacer<ts.Node, ts.Node>) {
		this.list.push(replacer);
	}

	get syntaxKinds() {
		const uniq = new Set<ts.SyntaxKind>();
		for (const { kinds } of this.list) {
			for (const kind of kinds) {
				uniq.add(kind);
			}
		}
		return [...uniq.values()];
	}
}
