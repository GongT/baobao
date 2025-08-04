import { AsyncDisposable, Emitter, toDisposable } from '@idlebox/common';
import { createLogger, type IMyLogger } from '@idlebox/logger';
import { DepGraph } from 'dependency-graph';
import { inspect, type InspectOptions, type InspectOptionsStylized } from 'node:util';

export abstract class AbstractBaseNode<State = any> extends AsyncDisposable {
	protected abstract readonly _dependencies: Set<string>;

	protected declare _state: State;
	private readonly _onStateChange = new Emitter<State>();
	public readonly onStateChange = this._onStateChange.register;
	protected declare readonly logger: IMyLogger;

	constructor(
		public readonly name: string,
		initState: State,
	) {
		super(`${new.target.name} ${name}`);
		this._state = initState;
		this._register(
			toDisposable(() => {
				if (this.imm) {
					clearImmediate(this.imm);
				}
			}),
		);
	}

	/** @internal */
	get state() {
		return this._state;
	}

	get dependencies(): ReadonlySet<string> {
		return this._dependencies;
	}

	addDependency(name: string) {
		this._dependencies.add(name);
	}

	removeDependency(name: string) {
		this._dependencies.delete(name);
	}

	protected setState(state: State) {
		if (this._state === state) return;

		this.logger.verbose`change state: ${this._state} => ${state}`;
		this._state = state;

		this.publishStateEvent();
	}

	private imm?: NodeJS.Immediate;
	protected publishStateEvent() {
		if (this.imm) {
			clearImmediate(this.imm);
		}
		this.imm = setImmediate(() => {
			this.imm = undefined;

			this.logger.verbose`publish current state: ${this._state}`;
			this._onStateChange.fire(this._state);
		});
	}

	// get state() {
	// 	return this._state;
	// }

	public translateState?(): string;
	protected debugPrefix() {
		return '○';
	}

	[inspect.custom](_d: number, _options: InspectOptionsStylized, _ins: typeof inspect) {
		const ss = this.translateState?.() ?? this._state;
		return `${this.debugPrefix()} [${this.displayName}] ${ss}`;
	}
}

export type ISummary = {
	totalColor?: string;
	statistics?: Record<string, number | string | boolean>;
};

export abstract class AbstractBaseGraph<T extends AbstractBaseNode> extends AsyncDisposable {
	private readonly graph = new DepGraph<T>({});
	public readonly overallOrder: readonly string[];
	protected readonly nodes: readonly T[];

	protected readonly _anyStateChange = new Emitter<T>();
	public readonly onAnyStateChange = this._anyStateChange.register;
	constructor(
		nodesIt: Iterable<T>,
		protected readonly logger: IMyLogger,
	) {
		super(logger.tag);

		this.nodes = Array.from(nodesIt);
		for (const node of this.nodes) {
			if (this.graph.hasNode(node.name)) {
				throw new Error(`duplicate node: ${node.name}`);
			}

			this.graph.addNode(node.name, node);
		}
		for (const node of this.nodes) {
			for (const dep of node.dependencies) {
				try {
					this.graph.addDependency(node.name, dep);
				} catch (e: any) {
					e.message = `添加依赖失败: ${node.name} -> ${dep}: ${e.message}`;
					throw e;
				}
			}
		}

		// 如果有环这个方法会抛出异常
		this.overallOrder = this.graph.overallOrder();
		this.overallOrderSorter = this.overallOrderSorter.bind(this);

		for (const node of this.nodes) {
			node.onStateChange(() => {
				this._anyStateChange.fireNoError(node);
			});
		}
	}

	get size() {
		return this.nodes.length;
	}

	/**
	 * 获取依赖项的列表
	 * @param name 当前项名称
	 * @param transitively 为true时包括所有间接依赖项
	 * @returns 依赖项列表
	 */
	public dependenciesOf(parent: string, transitively: boolean): string[] {
		if (transitively) {
			return this.graph.dependenciesOf(parent).sort(this.overallOrderSorter);
		} else {
			return this.graph.directDependenciesOf(parent).sort(this.overallOrderSorter);
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
			return this.graph.dependantsOf(parent).sort(this.overallOrderSorter);
		} else {
			return this.graph.directDependantsOf(parent).sort(this.overallOrderSorter);
		}
	}

	/**
	 * 根据整体顺序排序，数组使用此顺序排好后，顺序将会类似于overallOrder
	 */
	protected overallOrderSorter(a: string, b: string) {
		const indexA = this.overallOrder.indexOf(a);
		const indexB = this.overallOrder.indexOf(b);
		if (indexA === -1 || indexB === -1) {
			throw new Error(`sort error: node not found in overallOrder: ${indexA === -1 ? a : b}`);
		}
		return indexA - indexB;
	}

	getNodeByName(name: string): T {
		return this.graph.getNodeData(name);
	}

	override async dispose() {
		const ps = this.nodes.map((n) => n.dispose());
		await Promise.all([...ps]);
		this._anyStateChange.dispose();
		await super.dispose();
	}

	/**
	 * debug输出依赖图结构，类似：
	 * aaaa
	 * ├─ bbbb
	 * │  ├─ cccc
	 * │  └─ dddd
	 * └─ cccc
	 */
	debugFormatGraph(depth = Infinity) {
		const indent = (lines: string[], isLast: boolean) => {
			const c = isLast ? '  ' : '│ ';
			return lines.map((line) => `${c}${line}`);
		};
		const drawDepOne = (name: string, level: number) => {
			const result: string[] = [];
			const data = this.graph.directDependenciesOf(name);
			for (const dep of data) {
				const isLast = data.indexOf(dep) === data.length - 1;
				const c = isLast ? '└─' : '├─';

				result.push(`${c}${cusInspect(this.getNodeByName(dep))}`);

				if (depth <= level) continue;
				result.push(...indent(drawDepOne(dep, level + 1), isLast));
			}

			return result;
		};
		const result = [];
		const leafs = this.graph.entryNodes();
		for (const name of leafs) {
			result.push(cusInspect(this.getNodeByName(name)));

			if (depth === 0) continue;
			result.push(...drawDepOne(name, 1));
		}

		return result.join('\n');
	}
	debugFormatList() {
		const result = [];
		for (const name of this.graph.overallOrder()) {
			result.push(cusInspect(this.getNodeByName(name)));
		}
		return result.join('\n');
	}

	protected inspectSummary(): ISummary {
		const map: Record<string, number> = {};
		for (const node of this.nodes) {
			const stateStr = node.translateState?.() ?? 'unknown';
			if (map[stateStr]) {
				map[stateStr]++;
			} else {
				map[stateStr] = 1;
			}
		}
		return {
			statistics: map,
		};
	}

	debugFormatSummary() {
		const { totalColor, statistics } = this.inspectSummary();

		let c = '';
		let ce = statistics ? ' |' : '';
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

/**
 * 依赖关系图，包装 dependency-graph ，可一次性添加节点和依赖关系
 */
export abstract class AbstractGraphBuilder<T extends AbstractBaseNode, GT extends AbstractBaseGraph<T>> {
	protected readonly nodes = new Set<T>();
	protected finalized?: GT;

	constructor(protected readonly logger: IMyLogger = createLogger('graph:anonymouse')) {}

	protected getChildLogger(node: T) {
		return this.logger.extend(node.name);
	}

	public addNode(node: T) {
		this.logger.verbose`注册worker ${node.name}`;
		if (this.finalized) {
			throw new Error('依赖图已结束注册，不能再添加新的节点或依赖关系');
		}

		Object.assign(node, { logger: this.getChildLogger(node) });

		if (this.logger.verbose.isEnabled) {
			this.logger.verbose`依赖：${[...node.dependencies].join(', ')}`;
		}

		this.nodes.add(node);
		return node;
	}

	size() {
		return this.nodes.size;
	}

	get nodeNames() {
		return [...this.nodes].map((node) => node.name);
	}

	getNode(name: T | string) {
		if (typeof name === 'string') {
			for (const item of this.nodes) {
				if (item.name === name) {
					return item;
				}
			}
			throw new Error(`missing node with name ${name}`);
		} else {
			if (!this.nodes.has(name)) {
				throw new Error(`can not found node ${name.name} (by reference)`);
			}
			return name;
		}
	}

	public removeNode(name: T | string, withDependent = true) {
		const node = this.getNode(name);
		this.logger.verbose`删除worker ${node.name} (${withDependent})`;
		if (this.finalized) {
			throw new Error('依赖图已结束注册，不能再删除节点或依赖关系');
		}

		this.nodes.delete(node);
		if (withDependent) {
			for (const element of this.nodes) {
				element.removeDependency(node.name);
			}
		}
	}
	protected abstract _finalize(): GT;

	/**
	 * 结束注册
	 * 在调用此方法后，不能再添加新的节点
	 *
	 * @throws {import('dependency-graph').DepGraphCycleError} 如果有环，则抛出异常
	 */
	public finalize() {
		if (this.finalized) return this.finalized;

		this.logger.debug`完成worker注册, ${this.nodes.size}个节点`;

		this.finalized = this._finalize();

		return this.finalized;
	}
}

const insOpt: InspectOptions = {
	breakLength: 60,
	colors: true,
	depth: 1,
	maxArrayLength: 2,
	maxStringLength: 30,
	compact: true,
	customInspect: true,
	getters: false,
	showHidden: false,
	showProxy: false,
};

function cusInspect(node: AbstractBaseNode) {
	return inspect(node, insOpt).replace(/\n/g, '');
}
