import { DeferredPromise } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import { setImmediate } from 'node:timers/promises';
import { GraphBase } from './base.js';

export enum StartupState {
	Wait,
	Start,
	Done,
	Error,
}

interface IPriData {
	startupState: StartupState;
	initialize(): Promise<void>;
}

export abstract class StartupPump<T, pT> extends GraphBase<T, pT & IPriData> {
	private readonly working = new Map<string, Promise<void>>();

	constructor(
		private concurrency: number = 4,
		logger?: IMyLogger,
	) {
		super(logger);
	}

	protected override _addNode(
		name: string,
		dependencies: readonly string[],
		itemRef: T,
		pt: pT & Omit<IPriData, 'startupState'>,
	): void {
		super._addNode(name, dependencies, itemRef, {
			...pt,
			startupState: StartupState.Wait,
		});
	}

	protected abstract _isNodeSuccess(name: string, data: pT): boolean;
	protected isNodeSuccess(name: string): boolean {
		const data = this.getPrivateData(name);
		return data.startupState === StartupState.Done && this._isNodeSuccess(name, data);
	}

	private startPromise?: DeferredPromise<void>;
	async startup(change_concurrency?: number): Promise<this> {
		if (change_concurrency) {
			this.concurrency = change_concurrency;
		}

		super.finalize();

		if (!this.startPromise) {
			this._startup();
		}
		await this.startPromise!.p;

		return this;
	}

	private startupError?: Error;
	private async _startup() {
		this.startPromise = new DeferredPromise<void>();
		try {
			while (!this.startupError && !this.allInitialized) {
				this.pump();
				await Promise.race(this.working.values());
				this.logger?.debug(
					'succeeded race pump, working size %s, startup error: %s, all: %s',
					this.working.size,
					this.startupError,
					this.allInitialized,
				);
			}
		} catch (e) {
			this.startupError = e as Error;
		}

		if (this.startupError) {
			this.logger?.debug(' ---- failed startup');
			this.startPromise.error(this.startupError);
		} else {
			this.logger?.debug(' ---- succeeded startup');
			this.startPromise.complete();
		}
	}

	get allInitialized(): boolean {
		for (const name of this.overallOrder) {
			if (!this.isNodeSuccess(name)) {
				return false;
			}
		}
		return true;
	}

	protected leafNodes(): string[] {
		return this.overallOrder.filter((name) => {
			return this.isLeafNode(name);
		});
	}

	protected isLeafNode(name: string) {
		const dependencies = this.dependenciesOf(name, true);
		for (const name of dependencies) {
			if (!this.isNodeSuccess(name)) {
				return false;
			}
		}

		if (this.isNodeSuccess(name)) return false;

		return true;
	}

	protected isShutdown = false;
	dispose() {
		this.isShutdown = true;
		if (this.startPromise) {
			this.startupError = new Error('Shutdown');
			this.startPromise.error(this.startupError);
		}
	}

	/**
	 * 执行当前可以开始的节点的初始化过程
	 */
	protected pump() {
		if (this.working.size >= this.concurrency || this.isShutdown) return;
		const leafs = this.leafNodes().filter((name) => this.getPrivateData(name).startupState === StartupState.Wait);

		if (this.logger)
			this.logger
				.debug`[pump] working size: ${this.working.size}, concurrency: ${this.concurrency}, leafs to run: ${leafs}`;

		for (const name of leafs) {
			const data = this.getPrivateData(name);
			data.startupState = StartupState.Start;

			this.logger?.debug(`[pump][${name}] starting.`);
			const promise = setImmediate(0)
				.then(() => {
					return data.initialize();
				})
				.then(() => {
					this.logger?.debug(`[pump][${name}] done.`);
					data.startupState = StartupState.Done;
				})
				.catch((err: Error) => {
					this.logger?.debug(`[pump][${name}] error.`);
					data.startupState = StartupState.Error;
					this.startupError = err;
					throw err;
				})
				.finally(() => {
					this.working.delete(name);
				});
			this.working.set(name, promise);

			if (this.working.size >= this.concurrency) break;
		}
		if (this.logger) {
			this.logger.debug`       working size: ${this.working.size}`;
		}
	}

	protected isNodeInitialized(name: string): boolean {
		const d = this.getPrivateData(name);
		return d.startupState === StartupState.Done && this.isNodeSuccess(name);
	}

	/**
	 * 无法运行节点的判断:
	 * 1. 节点未初始化
	 * 2. 所有依赖项中，有任何一个未成功
	 * @param parent
	 */
	public blockedBy(parent: string): string[] {
		const r = [];
		if (this.isNodeInitialized(parent)) {
			return [];
		}

		for (const dep of this.dependenciesOf(parent, true)) {
			if (!this.isNodeInitialized(dep)) {
				r.push(dep);
			}
		}
		return r;
	}
}
