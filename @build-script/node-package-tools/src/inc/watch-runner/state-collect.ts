import { Disposable, registerGlobalLifecycle } from '@idlebox/common';
import { debug } from '../log.js';
import type { TerminalController } from '../terminal-controller.js';
import { WatchProgramRunner } from './program.js';

export enum RunState {
	Idle,
	Building,
	Success,
	Fail,
}

export class StateCollection extends Disposable {
	private readonly processes = new Map<WatchProgramRunner, RunState>();
	private readonly titles = new WeakMap<WatchProgramRunner, string>();
	private readonly empty: string[] = [];

	constructor(protected readonly terminal: TerminalController) {
		super();
		registerGlobalLifecycle(this);
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
				debug('编译结果: %s (%s)', title, success ? 'success' : 'failed');

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
			console.clear();
			return;
		}

		// this.terminal.line();

		this.terminal.writeLineAt(`${pending.length} 排队中; ${success.length} 成功; ${this.empty.length} 没有操作`, 2);
		this.terminal.writeLineAt(`编译失败 (${fail.length}): ${fail.join(', ')}`, 1);

		if (building.length > 0) {
			this.terminal.setSpin(true);
			this.terminal.setLastLine('编译中: ' + building.join(', '));
		} else {
			this.terminal.setSpin(false);
			this.terminal.setLastLine('待机...');
		}
	}
}
