import { DeferredPromise, registerGlobalLifecycle, sleep, toDisposable } from '@idlebox/common';
import { createLogger, EnableLogLevel } from '@idlebox/logger';
import { createInterface, type Interface } from 'node:readline/promises';
import { ProtocolClientObject, State } from '../common/protocol-client-object.js';
import type { WorkersManager } from '../common/workers-manager.js';

let rl: Interface;
let ended = false;
const logger = createLogger('repl', true);
logger.enable(EnableLogLevel.verbose);

export function readlineTestInit(manager: WorkersManager) {
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

	readlineMain(manager);
}

const spaces = /\s+/;
async function readlineMain(workersManager: WorkersManager) {
	const graph = workersManager.finalize();

	while (!ended) {
		const graphDebug = `${graph.debugFormatGraph()}\n${graph.debugFormatSummary()}`;
		const line = await rl.question(`${graphDebug}\n全部start: auto\n控制worker: [start|succ|fail|quit0|quit1] number\n> `);

		console.error(`\x1Bc输入了 ${line}\n`);

		if (!line) continue;

		if (line === 'auto') {
			for (const worker of InputTestClient.instances.values()) {
				worker.auto_success();
			}
			continue;
		}

		const [cmd, id] = line.split(spaces);
		const title = `manual-${id}`;
		const worker = InputTestClient.instances.get(title);
		if (!worker) {
			logger.error`worker with title "${title}" not found.`;
			continue;
		}

		switch (cmd) {
			case 'start':
				worker.test_start();
				break;
			case 'succ':
			case 'success':
				worker.test_succ();
				break;
			case 'fail':
				worker.test_fail();
				break;
			case 'quit0':
				worker.test_quit0();
				break;
			case 'quit1':
				worker.test_quit1();
				break;
			default:
				logger.error`unknown command "${cmd}"`;
		}
	}
}

export class InputTestClient extends ProtocolClientObject {
	private readonly dfd;

	static instances = new Map<string, InputTestClient>();

	constructor(title: string) {
		super(title);

		InputTestClient.instances.set(title, this);

		this.dfd = new DeferredPromise<void>();
	}

	protected override async _stop() {
		this.dfd.error(new Error('stopped by manager'));
	}

	test_quit0() {
		this.dfd.complete();
	}
	test_quit1() {
		this.dfd.error(new Error('test quit'));
	}

	test_start() {
		this.emitStart();
	}
	test_succ() {
		this.emitSuccess('test build complete');
	}
	test_fail() {
		this.emitFailure(new Error('test fail'));
	}

	private _auto = false;
	auto_success() {
		this._auto = true;
		if (this.state === State.COMPILE_STARTED) {
			this.test_succ();
		}
	}

	protected override async _execute() {
		this.test_start();
		if (this._auto) {
			await sleep(2000);
			this.test_succ();
		}
		return this.dfd.p;
	}
}
