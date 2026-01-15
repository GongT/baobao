import { createLogger, type IMyLogger } from '@idlebox/logger';
import { AbstractBaseGraph, AbstractBaseNode, AbstractGraphBuilder } from './base-graph.js';

export class SimpleNode<T> extends AbstractBaseNode<void> {
	protected override _dependencies: Set<string>;

	constructor(
		name: string,
		dependencies: readonly string[],
		public readonly attachedData: T,
	) {
		super(name);
		this._dependencies = new Set(dependencies);
	}
}

interface IArrayData<T> {
	readonly name: string;
	readonly dependencies: readonly string[];
	readonly data: T;
}

export type { SimpleDependencyGraph };
class SimpleDependencyGraph<T> extends AbstractBaseGraph<SimpleNode<T>> {
	protected override inspectSummary() {
		return {
			totalColor: '7',
		};
	}
}

export class SimpleDependencyBuilder<T> extends AbstractGraphBuilder<SimpleNode<T>, SimpleDependencyGraph<T>> {
	constructor(logger: IMyLogger = createLogger('simple-graph:anonymouse')) {
		super(logger);
	}

	protected override _finalize() {
		return new SimpleDependencyGraph<T>(this.nodes, this.logger);
	}

	static from<T = unknown>(nodes: ReadonlyArray<IArrayData<T>>, logger?: IMyLogger) {
		const g = new SimpleDependencyBuilder<T>(logger);
		for (const node of nodes) {
			g.addNode(new SimpleNode(node.name, node.dependencies, node.data));
		}
		return g.finalize();
	}
}
