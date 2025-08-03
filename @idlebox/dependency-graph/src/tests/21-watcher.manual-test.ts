import { DeferredPromise, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { createInterface, type Interface } from 'node:readline/promises';
import { inspect } from 'node:util';
import { JobGraphBuilder } from '../common/job-graph.build.js';
import { Job } from '../common/job-graph.job.js';
import { JobState } from '../common/job-graph.lib.js';
import { pause, type IPauseControl } from '../common/pause-interface.js';

let rl: Interface;
let ended = false;
createRootLogger('repl');
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

	registerNodejsExitHandler();

	readlineMain().catch((e) => {
		if (e.name === 'AbortError') {
			console.error('\x1Bcreadline aborted');
			dep.finalize().dispose();
			return;
		}
		throw e;
	});
}

async function readlineMain() {
	while (!ended) {
		const _line = await rl.question(`${inspect(dep.finalize())}\n全启动: auto\n控制worker: [start|succ|fail|quit0|quit1] number\n> `);
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
				worker.fireStart();
				break;
			case 's':
			case 'succ':
			case 'success':
				worker.fireSuccess();
				break;
			case 'f':
			case 'fail':
				worker.fireError(new Error(`触发失败事件`));
				break;
			case 'quit0':
				worker.quitWith();
				break;
			case 'quit1':
				worker.quitWith(new Error(`触发进程异常退出`));
				break;
			default:
				logger.error`unknown command "${cmd}"`;
		}
	}
}

class WatchProgram extends Job<string> {
	private readonly process = new DeferredPromise<void>();
	quitWith(result?: Error) {
		if (result) {
			this.process.error(result);
		} else {
			this.process.complete();
		}
	}
	fireError(e: Error) {
		this.setState(JobState.Error, e);
	}
	fireSuccess() {
		this.setState(JobState.Success, 'wow success');
	}
	fireStart() {
		this.setState(JobState.Running);
	}

	override async _execute(): Promise<void> {
		logger.log(`[${this.name}] Executing (auto=${this._auto})...`);

		if (this._auto) this.setState(JobState.Running);

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
		this.fireSuccess();
	}

	private pause = false;
	public readonly [pause]: IPauseControl = {
		isPaused: () => this.pause,
		pause: async () => {
			this.pause = true;
		},
		resume: async () => {
			this.pause = false;
		},
	};
}

class ProgramStorage {
	private readonly programs: Record<string, WatchProgram> = {};

	new(name: string, deps: string[]): WatchProgram {
		const p = new WatchProgram(name, deps);
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

const dep = new JobGraphBuilder(2, logger);

const programs = new ProgramStorage();
dep.addNode(programs.new('aaa', ['bbb', 'ccc']));
dep.addNode(programs.new('bbb', ['ddd']));
dep.addNode(programs.new('ccc', ['ddd']));
dep.addNode(programs.new('ddd', []));

dep.finalize();

readlineTestInit();

async function main() {
	await dep
		.finalize()
		.startup()
		.catch((e) => {
			logger.log('============== process quit with failed state ==============');
			throw e;
		});
	logger.log('============== process quit completed ==============');
}

+main();
