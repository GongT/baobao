import type { IMyLogger } from '@idlebox/logger';
import { StartupPump, StartupState } from './startup.pump.js';

interface IExecuteAttach {
	hasSuccess: boolean;
}

interface IArrayData<T = any> {
	readonly name: string;
	readonly dependencies: readonly string[];
	readonly data: T;

	/**
	 * 初始化执行器
	 * resolve后执行后续的
	 * reject后执行失败，不会再执行其他东西
	 */
	initialize(): Promise<void>;
}

/**
 * 执行器依赖图，用于启动一系列需要依赖关系的东西
 */
export class ExecuterDependencyGraph<T> extends StartupPump<T, IExecuteAttach> {
	static from<T = unknown>(nodes: ReadonlyArray<IArrayData<T>>, logger?: IMyLogger) {
		const g = new ExecuterDependencyGraph<T>(4, logger);
		for (const node of nodes) {
			g.addNode(node.name, node.dependencies, node.initialize, node.data);
		}
		g.finalize();
		return g;
	}

	addNode(name: string, dependencies: readonly string[], initialize: IArrayData['initialize'], itemRef: T) {
		this._addNode(name, dependencies, itemRef, {
			hasSuccess: false,
			async initialize() {
				await initialize();
				this.hasSuccess = true;
			},
		});
	}

	protected override _isNodeSuccess(_name: string, data: IExecuteAttach): boolean {
		return data.hasSuccess;
	}

	protected override inspectTitlePrefix(name: string) {
		const data = this.getPrivateData(name);
		if (data.startupState === StartupState.Wait) {
			if (this.isLeafNode(name)) {
				return '●';
			} else {
				return '○';
			}
		} else {
			let c = '9';
			if (data.startupState === StartupState.Start) {
				c = '14';
			} else if (data.hasSuccess) {
				c = '10';
			}
			return `\x1b[38;5;${c}m●\x1b[39m`;
		}
	}

	protected override inspectSummary() {
		let uninit = 0;
		let succ = 0;
		let fail = 0;
		for (const name of this.overallOrder) {
			const data = this.getPrivateData(name);
			if (data.startupState === StartupState.Wait) {
				uninit++;
			} else if (data.hasSuccess) {
				fail++;
			} else if (data.hasSuccess) {
				succ++;
			}
		}

		const c = fail ? '48;5;1' : '48;5;238';

		return { statistics: { 未初始化: uninit, 成功: succ, 失败: fail }, totalColor: c };
	}
}
