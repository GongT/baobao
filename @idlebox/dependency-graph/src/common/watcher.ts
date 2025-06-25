import { DeferredPromise, type EventRegister } from '@idlebox/common';
import { StartupPump, StartupState } from './startup.pump.js';

interface IWatchAttach {
	died: boolean;

	isRunning: boolean;
	lastError?: Error;
}

export interface IWatchEvents {
	onSuccess: EventRegister<void>;
	onFailed: EventRegister<Error>;
	onRunning: EventRegister<void>;
	/**
	 * 运行程序
	 * 对于watcher，除非退出，否则不应该resolve（或reject）
	 * 对于builder，函数应该要resolve
	 */
	execute(): Promise<void>;
}

interface IWatcherElement extends IWatchEvents {
	name: string;
	dependencies: readonly string[];
}

abstract class RunBase extends StartupPump<IWatchEvents, IWatchAttach> {
	protected readonly _onProcessQuit = new DeferredPromise<void>();

	getErrors() {
		return this.overallOrder
			.map((name) => {
				return this.getPrivateData(name).lastError;
			})
			.filter((e) => !!e)
			.reverse();
	}

	public addEmptyNode(name: string) {
		super._addEmptyNode(name, {} as any, {
			died: false,
			isRunning: false,
			lastError: undefined,
		});
	}

	protected override _isNodeSuccess(_name: string, data: IWatchAttach): boolean {
		return data.isRunning === false && data.lastError === undefined;
	}

	override dispose() {
		super.dispose();
		this._onProcessQuit.complete();
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
			if (data.startupState === StartupState.Start || data.isRunning) {
				c = '14';
			} else if (!data.lastError) {
				c = '10';
			}
			return `\x1b[38;5;${c}m●\x1b[39m`;
		}
	}

	override inspectSummary() {
		let uninit = 0;
		let succ = 0;
		let fail = 0;
		let runn = 0;
		for (const name of this.overallOrder) {
			const data = this.getPrivateData(name);
			if (data.startupState === StartupState.Wait) {
				uninit++;
			} else if (data.startupState === StartupState.Error || data.lastError) {
				fail++;
			} else if (data.isRunning) {
				runn++;
			} else {
				succ++;
			}
		}

		const r: Record<string, number> = {
			成功: succ,
			失败: fail,
			运行中: runn,
		};
		if (uninit) {
			r.未初始化 = uninit;
		}

		return {
			statistics: r,
			totalColor: fail ? '48;5;1' : '48;5;238',
		};
	}
}

export class WatcherDependencyGraph extends RunBase {
	static from(nodes: ReadonlyArray<IWatcherElement>) {
		const g = new WatcherDependencyGraph();
		for (const node of nodes) {
			g.addNode(node.name, node.dependencies, node);
		}
		g.finalize();
		return g;
	}

	addNode(name: string, dependencies: readonly string[], events: IWatchEvents) {
		const dfd = new DeferredPromise<void>();
		this._addNode(name, dependencies, events, {
			died: false,
			isRunning: false,
			lastError: undefined,
			initialize: () => {
				events.onSuccess.once(() => {
					this.logger?.debug(`[${name}] watcher first time success`);
					dfd.complete();
				});

				this.executeOne(name);

				return dfd.p;
			},
		});
	}

	/**
	 * 运行到watch退出才resolve
	 */
	override async startup() {
		await Promise.all([
			super.startup(),
			//
			this._onProcessQuit.p,
		]);
		this.logger?.debug('[WatcherDependencyGraph] startup complete, waiting for process quit');
		return this;
	}

	private async executeOne(name: string) {
		const status = this.getPrivateData(name);
		const events = this.getNodeData(name);

		events.onRunning(() => {
			this.logger?.verbose(`[${name}] onRunning`);
			status.isRunning = true;
		});
		events.onFailed((e) => {
			this.logger?.verbose(`[${name}] onFailed`);
			status.isRunning = false;
			status.lastError = e;
		});
		events.onSuccess(() => {
			this.logger?.verbose(`[${name}] onSuccess`);
			status.isRunning = false;
			status.lastError = undefined;
			this.pump();
		});

		try {
			await events.execute();
			this.logger?.debug('[%s] executeOne success', name);
		} catch (e) {
			this.logger?.debug('[%s] executeOne error', name);
			status.lastError = e as Error;
		} finally {
			status.isRunning = false;
			status.died = true;
		}

		this.logger?.debug('[%s] executeOne returned [%s]', name, status.lastError?.message);
		if (this.isShutdown) {
			const allQuit = this.overallOrder.every((name) => this.getPrivateData(name).died);
			if (allQuit) {
				this._onProcessQuit.complete();
			}
		} else {
			this.logger?.debug('[%s] executeOne return without shutdown state', name);
			this._onProcessQuit.error(status.lastError || new Error('watch execute returned'));
		}
	}
}

export class BuilderDependencyGraph extends RunBase {
	static from(nodes: ReadonlyArray<IWatcherElement>) {
		const g = new WatcherDependencyGraph();
		for (const node of nodes) {
			g.addNode(node.name, node.dependencies, node);
		}
		g.finalize();
		return g;
	}

	addNode(name: string, dependencies: readonly string[], events: IWatchEvents) {
		this._addNode(name, dependencies, events, {
			died: false,
			isRunning: false,
			lastError: undefined,
			initialize: () => {
				return this.executeOne(name);
			},
		});
	}

	private async executeOne(name: string) {
		const status = this.getPrivateData(name);
		const events = this.getNodeData(name);

		events.onRunning(() => {
			this.logger?.verbose(`[${name}] onRunning`);
			status.isRunning = true;
		});
		events.onFailed((e) => {
			this.logger?.verbose(`[${name}] onFailed`);
			status.isRunning = false;
			status.lastError = e;
		});
		events.onSuccess(() => {
			this.logger?.verbose(`[${name}] onSuccess`);
			status.isRunning = false;
			status.lastError = undefined;
			this.pump();
		});

		try {
			await events.execute();
		} catch (e) {
			status.lastError = e as Error;
		} finally {
			status.isRunning = false;
			status.died = true;
		}

		if (status.lastError) {
			this.logger?.debug('[%s] executeOne error', name);
			throw status.lastError;
		} else {
			this.logger?.debug('[%s] executeOne success', name);
		}

		this.pump();
	}
}
