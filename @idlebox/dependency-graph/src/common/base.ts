import type { IMyLogger } from '@idlebox/logger';
import { DepGraph } from 'dependency-graph';
import { inspect } from 'node:util';

export interface IDependencyGraphData<T, PrivateT> {
	readonly name: string;
	readonly dependencies: readonly string[];

	reference: T;
	readonly privateData: PrivateT;
}

export abstract class GraphBase<T, pT> {
	private readonly graph = new DepGraph<IDependencyGraphData<T, pT>>();
	private readonly reverse = new Map<T, string>();
	public declare readonly overallOrder: readonly string[];

	constructor(protected logger?: IMyLogger) {}

	protected _addNode(name: string, dependencies: readonly string[], itemRef: T, pt: pT) {
		if (this.finalized) {
			throw new Error('依赖图已结束注册，不能再添加新的节点或依赖关系');
		}
		this.logger?.debug(`注册worker ${name}`);
		this.logger?.verbose(`依赖：${dependencies.join(', ')}`);
		this.graph.addNode(name, { name, dependencies, reference: itemRef, privateData: pt });
		this.reverse.set(itemRef, name);
	}

	size() {
		return this.graph.size();
	}

	protected getPrivateData(name: string) {
		return this.graph.getNodeData(name).privateData;
	}
	getNodeData(name: string) {
		return this.graph.getNodeData(name).reference;
	}
	setNodeData(name: string, data: T) {
		const d = this.graph.getNodeData(name);
		this.reverse.delete(d.reference);

		d.reference = data;
		this.reverse.set(data, name);
	}
	getNodeName(data: T): string {
		const r = this.reverse.get(data);

		if (!r) throw new Error(`未找到节点名称：${inspect(data)}`);

		return r;
	}

	/**
	 * 获取依赖项的列表
	 * @param name 当前项名称
	 * @param transitively 为true时包括所有间接依赖项
	 * @returns 依赖项列表
	 */
	public dependenciesOf(parent: string, transitively: boolean): string[] {
		if (transitively) {
			return this.graph.dependenciesOf(parent);
		} else {
			return this.graph.directDependenciesOf(parent);
		}
	}

	/**
	 * 获取依赖当前项的列表
	 * @param parent 当前项名称
	 * @param transitively 为true时包括所有间接依赖项
	 * @returns 依赖项列表
	 */
	public dependantsOf(parent: string, transitively: boolean): string[] {
		if (transitively) {
			return this.graph.dependantsOf(parent);
		} else {
			return this.graph.directDependantsOf(parent);
		}
	}

	entryNodes(): string[] {
		return this.graph.entryNodes();
	}

	protected finalized = false;
	/**
	 * 结束注册
	 * 在调用此方法后，不能再添加新的节点
	 *
	 * @throws {import('dependency-graph').DepGraphCycleError} 如果有环，则抛出异常
	 */
	public finalize() {
		if (this.finalized) return;
		this.finalized = true;

		this.logger?.debug(`完成worker注册, ${this.graph.size()}个节点`);

		for (const name of this.reverse.values()) {
			const dependencies = this.graph.getNodeData(name).dependencies;
			for (const dep of dependencies) {
				this.graph.addDependency(name, dep);
			}
		}

		// 如果有环这个方法会抛出异常
		const list = this.graph.overallOrder();
		Object.defineProperty(this, 'overallOrder', {
			value: list,
			configurable: false,
			enumerable: true,
			writable: false,
		});
	}

	protected abstract inspectTitlePrefix(name: string): string;

	/**
	 * debug输出依赖图结构，类似：
	 * aaaa
	 * ├─ bbbb
	 * │  ├─ cccc
	 * │  └─ dddd
	 * └─ cccc
	 */
	debugFormatGraph() {
		const indent = (lines: string[], isLast: boolean) => {
			const c = isLast ? '  ' : '│ ';
			return lines.map((line) => `${c}${line}`);
		};
		const inspectTitle = (name: string) => {
			const text = `${name} - ${inspect(this.getNodeData(name)).replace(/\n/g, '').slice(0, 80)}`;
			const prefix = this.inspectTitlePrefix(name);
			return `${prefix}${prefix ? ' ' : ''}${text}`;
		};
		const drawDepOne = (name: string) => {
			let result: string[] = [];
			const data = this.graph.directDependenciesOf(name);
			for (const dep of data) {
				const isLast = data.indexOf(dep) === data.length - 1;
				const c = isLast ? '└─' : '├─';

				result.push(`${c}${inspectTitle(dep)}`);

				result.push(...indent(drawDepOne(dep), isLast));
			}

			return result;
		};
		let result = [];
		const leafs = this.graph.entryNodes();
		for (const name of leafs) {
			result.push(inspectTitle(name));
			result.push(...drawDepOne(name));
		}

		return result.join('\n');
	}

	protected abstract inspectSummary(): ISummary;

	debugFormatSummary() {
		const { totalColor, statistics } = this.inspectSummary();

		let c = '';
		let ce = ' |';
		if (totalColor) {
			c = `\x1b[${totalColor}m `;
			ce = ' \x1b[0m';
		}

		const m = [];
		if (statistics) {
			for (const [key, value] of Object.entries(statistics)) {
				m.push(`${key}: \x1b[38;5;14m${value}\x1B[0m`);
			}
		}

		return `${c}总数: ${this.graph.size()}${ce} ${m.join(' | ')}`;
	}

	protected [inspect.custom]() {
		return `[DependencyGraph ${this.graph.size()}] ${this.debugFormatSummary()}\n${this.debugFormatGraph()}`;
	}
}
type ISummary = {
	totalColor?: string;
	statistics?: Record<string, number>;
};

interface IArrayData<T> {
	readonly name: string;
	readonly dependencies: readonly string[];
	readonly data: T;
}

export class SimpleDependencyGraph<T> extends GraphBase<T, void> {
	public addNode(name: string, dependencies: readonly string[], itemRef: T) {
		this._addNode(name, dependencies, itemRef);
	}

	static from<T = unknown>(nodes: ReadonlyArray<IArrayData<T>>, logger?: IMyLogger) {
		const g = new SimpleDependencyGraph<T>(logger);
		for (const node of nodes) {
			g.addNode(node.name, node.dependencies, node.data);
		}
		g.finalize();
		return g;
	}

	protected override inspectSummary() {
		return {};
	}
	protected override inspectTitlePrefix(_name: string): string {
		return '';
	}
}
