import { Disposable, registerGlobalLifecycle } from '@idlebox/common';
import { CSI, logger } from '../functions/log.js';
import type { TerminalController } from '../functions/terminal-controller.js';
import type { WatchProgramRunner } from './program.js';

export enum RunState {
	Idle = 0,
	Building = 1,
	Success = 2,
	Fail = 3,
}

export class StateCollection extends Disposable {
	private readonly processes = new Map<WatchProgramRunner, RunState>();
	private readonly titles = new WeakMap<WatchProgramRunner, string>();
	private readonly empty: string[] = [];

	constructor(protected readonly terminal: TerminalController) {
		super();
		registerGlobalLifecycle(this);
		logger.debug('初始化StateCollection');
	}

	public addDummy(title: string) {
		this.empty.push(title);
	}

	public add(title: string, process: WatchProgramRunner) {
		this.processes.set(process, RunState.Idle);
		this.titles.set(process, title);

		this._register(
			process.onBuildStart(() => {
				this.processes.set(process, RunState.Building);
				this.update();
			})
		);
		this._register(
			process.onBuildStop((success) => {
				logger.debug('编译结果: %s (%s)', title, success ? 'success' : 'failed');

				if (success) {
					this.processes.set(process, RunState.Success);
				} else {
					this.processes.set(process, RunState.Fail);
				}
				this.update();
			})
		);
	}

	public getState() {
		const pending = [];
		const building = [];
		const success = [];
		const fail = [];

		for (const [process, state] of this.processes.entries()) {
			const title = this.titles.get(process)!;

			if (state === RunState.Idle) {
				pending.push(title);
			} else if (state === RunState.Building) {
				building.push(title);
			} else if (state === RunState.Success) {
				success.push(title);
			} else if (state === RunState.Fail) {
				fail.push(title);
			}
		}

		return { pending, building, success, fail };
	}

	private update() {
		const { pending, building, success, fail } = this.getState();

		if (pending.length === 0 && building.length === 0 && success.length === 0 && fail.length === 0) {
			process.stderr.write(`${CSI}c`);
			return;
		}

		// this.terminal.line();

		this.terminal.writeLineAt(`${success.length} 成功; ${this.empty.length} 没有操作`, 3);
		this.terminal.writeLineAt(`排队中 (${pending.length}): ${pending.join(', ')}`, 2);
		this.terminal.writeLineAt(`编译失败 (${fail.length}): ${fail.join(', ')}`, 1);

		if (building.length > 0) {
			this.terminal.setSpin(true);
			this.terminal.setLastLine(`编译中 (${building.length}): ${building.join(', ')}`);
		} else {
			this.terminal.setSpin(false);
			this.terminal.setLastLine('待机...');
		}
	}
}
