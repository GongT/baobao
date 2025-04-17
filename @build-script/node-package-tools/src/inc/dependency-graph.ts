import { DepGraph, DepGraphCycleError } from 'dependency-graph';
import { logger } from './log.js';
import type { IPackageInfo } from './mono-tools.js';

interface IGraphData {
	readonly name: string;
	readonly dependencies: readonly string[];
	completed: boolean;
	readonly reference: Readonly<IPackageInfo>;
}

export async function prepareMonorepoDeps(list: readonly IPackageInfo[]) {
	const deps = new DependEmitter();

	for (const item of list) {
		deps.addNode(item.name, item.dependencies, item);
	}

	deps.detectLoop();
	return deps;
}

export class DependEmitter {
	private readonly deps = new DepGraph<IGraphData>();

	public addNode(name: string, dependencies: readonly string[], itemRef: IPackageInfo) {
		this.deps.addNode(name, { name, dependencies, completed: false, reference: itemRef });
	}

	public setComplated(name: string) {
		logger.debug('✅ %s complete', name);
		this.deps.getNodeData(name).completed = true;
	}

	public detectLoop() {
		/*
			检查是否有环
			如果有环，输出形成环的列表，用->连接，头尾同名
			例如：a->b->c->a
		*/

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
				console.log(`检测到环：${cyclePath.join('->')}`);
			} else {
				throw error;
			}
		}
	}

	public getNotCompletedLeaf(): string[] {
		/*
		 * 查找未完成的叶子节点
		 * 叶子节点定义为：
		 * completed=false
		 * 并且：
		 * 	没有依赖
		 * 	或者所有直接依赖都已经标记为completed
		 */
		const incompleteList = this.filterIncomplete(this.deps.overallOrder());
		const ret = incompleteList.filter((name) => {
			return !this.hasIncompleteDependency(name);
		});
		logger.debug('[deps] !complete=%s / all=%s / leaf=%s', incompleteList.length, this.deps.size(), ret.length);
		return ret;
	}

	getIncompleteWithOrder() {
		return this.filterIncomplete(this.deps.overallOrder()).map((e) => this.deps.getNodeData(e));
	}

	private isNodeComplete(name: string) {
		return this.deps.getNodeData(name).completed;
	}

	private hasIncompleteDependency(parent: string) {
		return this.filterIncomplete(this.deps.directDependenciesOf(parent)).length === 0;
	}

	private filterIncomplete(items: readonly string[]) {
		return items.filter((name) => {
			return !this.isNodeComplete(name);
		});
	}
}
