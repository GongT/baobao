import type { IMyLogger } from '@idlebox/logger';
import { DepGraph, DepGraphCycleError } from 'dependency-graph';
import { inspect } from 'node:util';

interface IGraphData<T> {
	readonly name: string;
	readonly dependencies: readonly string[];
	readonly reference: Readonly<T>;
	/**
	 * 是否已初始化（开始执行）
	 */
	initialized: boolean;
	/**
	 * 当前状态是否为成功
	 */
	succeed: boolean;
}

// const everyLineStart = /^/gm;

export class DependencyGraph<T> {
	private readonly deps = new DepGraph<IGraphData<T>>();
	private finalized = false;

	constructor(protected readonly logger: IMyLogger) {}

	public addNode(name: string, dependencies: readonly string[], itemRef: T) {
		if (this.finalized) {
			throw new Error('依赖图已结束注册，不能再添加新的节点或依赖关系');
		}
		this.deps.addNode(name, { name, dependencies, initialized: false, succeed: false, reference: itemRef });
	}

	public setInitialized(name: string) {
		if (this.blockedBy(name).length > 0) {
			// 按说不会发生
			throw new Error(`无法设置状态，节点 ${name} 仍被依赖项阻塞：${this.blockedBy(name).join(', ')}`);
		}
		this.logger.debug('🔸 %s initializing', name);
		this.deps.getNodeData(name).initialized = true;
	}

	public getStatus(name: string): boolean {
		const data = this.deps.getNodeData(name);
		return data.succeed;
	}
	public setStatus(name: string, succeed: boolean) {
		const data = this.deps.getNodeData(name);

		if (!data.initialized) {
			// 按说不会发生
			this.logger.fatal`无法设置状态，节点 ${name} 从未启动`;
		}
		if (this.blockedBy(name).length > 0) {
			// 按说不会发生
			this.logger.fatal`无法设置状态，节点 ${name} 仍被依赖项阻塞：${this.blockedBy(name).join(', ')}`;
		}

		const emoji = succeed ? '✅' : '💥';
		this.logger.debug`${emoji} ${name} complete`;
		data.succeed = succeed;
	}

	public getReference(name: string): T {
		return this.deps.getNodeData(name).reference;
	}

	/**
	 * 结束注册
	 * 在调用此方法后，不能再添加新的节点
	 *
	 * 检查是否有环
	 * 如果有环则异常退出
	 *
	 * 输出形成环的列表，用->连接，头尾同名
	 *   例如：a->b->c->a
	 */
	public finalize() {
		this.finalized = true;

		for (const name of this.deps.overallOrder()) {
			const dependencies = this.deps.getNodeData(name).dependencies;
			for (const dep of dependencies) {
				this.deps.addDependency(name, dep);
			}
		}
		try {
			this.deps.overallOrder();
		} catch (error) {
			if (error instanceof DepGraphCycleError) {
				const cyclePath = error.cyclePath;
				this.logger.fatal(`检测到环：${cyclePath.join('->')}`);
			} else {
				throw error;
			}
		}

		if (this.logger.debug.isEnabled) {
			this.logger.debug('DependencyGraph::finished | 依赖结构：');
			for (const line of this.debugFormatGraph().split('\n')) {
				this.logger.debug(line);
			}
		}
	}

	/**
	 * debug输出依赖图结构，类似：
	 * aaaa
	 * ├─ bbbb
	 * │  ├─ cccc
	 * │  └─ dddd
	 * └─ cccc
	 */
	debugFormatGraph() {
		const color = (name: string) => {
			const data = this.deps.getNodeData(name);
			if (data.initialized) {
				const c = data.succeed ? '10' : '9';
				return `\x1b[38;5;${c}m●\x1b[39m ${name} - ${inspect(data.reference).replace(/\n/g, '').slice(0, 80)}`;
			} else {
				return `○ ${name} - ${inspect(data.reference).replace(/\n/g, '').slice(0, 80)}`;
			}
		};
		const indent = (lines: string[], isLast: boolean) => {
			const c = isLast ? '  ' : '│ ';
			return lines.map((line) => `${c}${line}`);
		};
		const drawDepOne = (name: string) => {
			let result: string[] = [];
			const data = this.deps.directDependenciesOf(name);
			for (const dep of data) {
				const isLast = data.indexOf(dep) === data.length - 1;
				const c = isLast ? '└─' : '├─';
				result.push(`${c}${color(dep)}`);

				result.push(...indent(drawDepOne(dep), isLast));
			}

			return result;
		};
		let result = [];
		const leafs = this.deps.entryNodes();
		for (const name of leafs) {
			result.push(color(name));
			result.push(...drawDepOne(name));
		}

		return result.join('\n');
	}
	debugSummary() {
		let uninit = 0;
		let succ = 0;
		let fail = 0;
		for (const name of this.deps.overallOrder()) {
			const data = this.deps.getNodeData(name);
			if (!data.initialized) {
				uninit++;
			} else if (data.succeed) {
				succ++;
			} else {
				fail++;
			}
		}

		const u = uninit ? `未初始化: ${uninit} | ` : '';
		const c = fail + uninit ? '48;5;1' : '48;5;238';

		return `\x1B[${c}m 总数: ${this.deps.size()} \x1B[0m ${u}成功: ${succ} | 失败: ${fail}`;
	}

	[inspect.custom]() {
		return `[DependencyGraph ${this.deps.size()}]\n${this.debugSummary()}\n${this.debugFormatGraph()}`;
	}

	/**
	 * 获取依赖项的列表
	 * @param name 当前项名称
	 * @param transitively 为true时包括所有间接依赖项
	 * @returns 依赖项列表
	 */
	public dependenciesOf(parent: string, transitively: boolean): string[] {
		if (transitively) {
			return this.deps.dependenciesOf(parent);
		} else {
			return this.deps.directDependenciesOf(parent);
		}
	}

	/**
	 * 查找未初始化的叶子节点
	 * 叶子节点定义为：
	 * initialized=false
	 * 并且：
	 * 	所有直接以及间接依赖都已经标记为 succeed
	 */
	public getNotInitializedLeaf(limit: number = Number.POSITIVE_INFINITY): T[] {
		const ret: T[] = [];
		for (const name of this.deps.overallOrder()) {
			const self = this.deps.getNodeData(name);
			if (self.initialized) continue;

			const blockers = this.blockedBy(name);
			if (blockers.length > 0) continue;

			ret.push(self.reference);
			if (ret.length >= limit) break;
		}
		return ret;
	}

	get size() {
		return this.deps.size();
	}

	/**
	 * 无法运行节点的判断:
	 * 1. 节点未初始化
	 * 2. 所有依赖项中，有任何一个未成功
	 * @param parent
	 */
	public blockedBy(parent: string): string[] {
		const r = [];
		if (this.deps.getNodeData(parent).initialized) {
			return [];
		}

		const dependencies = this.deps.dependenciesOf(parent);
		for (const dep of dependencies) {
			if (!this.deps.getNodeData(dep).succeed) {
				r.push(dep);
			}
		}
		return r;
	}

	// private isNodeComplete(name: string) {
	// 	const data = this.deps.getNodeData(name);
	// 	const r = data.initialized && data.succeed;
	// 	this.logger.verbose('isNodeComplete: ', name, r);
	// 	return r;
	// }
}
