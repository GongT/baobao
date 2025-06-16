import { DeferredPromise, Emitter, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createLogger, EnableLogLevel } from '@idlebox/logger';
import { createInterface, Interface } from 'node:readline/promises';
import { inspect } from 'node:util';
import { WatcherDependencyGraph, type IWatchEvents } from './watcher.js';

let rl: Interface;
let ended = false;
const logger = createLogger('repl', true);
logger.enable(EnableLogLevel.verbose);

export function readlineTestInit() {
	if (rl) return;

	rl = createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
	});

	registerGlobalLifecycle(
		toDisposable(() => {
			ended = true;
			rl.close();
		}),
	);

	readlineMain().catch((e) => {
		if (e.name === 'AbortError') {
			console.error('\x1Bcreadline aborted');
			dep.dispose();
			for (const worker of programs.each()) {
				worker.process.complete();
			}
			return;
		}

		throw e;
	});
}

async function readlineMain() {
	while (!ended) {
		const _line = await rl.question(
			`${inspect(dep)}\n全启动: auto\n控制worker: [start|succ|fail|quit0|quit1] number\n> `,
		);
		const line = _line.trim();

		console.error(`\x1Bc输入了 "${line}"\n`);

		if (!line) continue;

		if (line === 'auto') {
			for (const worker of programs.each()) {
				worker.auto();
			}
			continue;
		}

		const [cmd, id] = line.split(/\s+/);
		const title = `${id}`;
		const worker = programs.get(title);
		if (!worker) {
			logger.error`worker with title "${title}" not found.`;
			continue;
		}

		switch (cmd) {
			case 'start':
				worker._onRunning.fire();
				break;
			case 's':
			case 'succ':
			case 'success':
				worker._onSuccess.fire();
				break;
			case 'f':
			case 'fail':
				worker._onFailed.fire(new Error(`触发失败事件`));
				break;
			case 'quit0':
				worker.process.complete();
				break;
			case 'quit1':
				worker.process.error(new Error(`触发进程异常退出`));
				break;
			default:
				logger.error`unknown command "${cmd}"`;
		}
	}
}

class WatchProgram implements IWatchEvents {
	public readonly _onSuccess = new Emitter<void>();
	public readonly onSuccess = this._onSuccess.event;

	public readonly _onFailed = new Emitter<Error>();
	public readonly onFailed = this._onFailed.event;

	public readonly _onRunning = new Emitter<void>();
	public readonly onRunning = this._onRunning.event;

	public readonly process = new DeferredPromise<void>();

	constructor(public readonly name: string) {}

	async execute(): Promise<void> {
		logger.log(`[${this.name}] Executing (auto=${this._auto})...`);

		if (this._auto) this._onSuccess.fire();

		try {
			await this.process.p;
			logger.log(`[${this.name}] process stopped (with success)`);
		} catch (e) {
			logger.error(`[${this.name}] process stopped (with error)`);
			throw e;
		}
	}

	private _auto = false;
	auto(): void {
		if (!this._auto) this._auto = true;
		this._onSuccess.fire();
	}

	[inspect.custom]() {
		return `\x1B[2;3m[WatchProgram ${this.name}]\x1B[0m`;
	}
}

class ProgramStorage {
	private readonly programs: Record<string, WatchProgram> = {};

	new(name: string): WatchProgram {
		const p = new WatchProgram(name);
		this.programs[name] = p;
		return p;
	}

	get(name: string): undefined | WatchProgram {
		return this.programs[name];
	}

	each() {
		return Object.values(this.programs);
	}
}

const dep = new WatcherDependencyGraph(2, logger);

const programs = new ProgramStorage();
dep.addNode('aaa', ['bbb', 'ccc'], programs.new('aaa'));
dep.addNode('bbb', ['ddd'], programs.new('bbb'));
dep.addNode('ccc', ['ddd'], programs.new('ccc'));
dep.addNode('ddd', [], programs.new('ddd'));

dep.finalize();

readlineTestInit();

async function main() {
	logger.debug`${dep}`;

	await dep.startup().catch((e) => {
		logger.log('============== process quit with failed state ==============');
		throw e;
	});
	logger.log('============== process quit completed ==============');

	logger.debug`${dep}`;
}

+main();
