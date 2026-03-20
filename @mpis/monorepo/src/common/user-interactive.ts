import { convertCaughtError, InterruptError, prettyPrintError, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createLogger, EnableLogLevel } from '@idlebox/logger';
import { createInterface, type Interface } from 'node:readline/promises';
import { inspect } from 'node:util';
import type { IPnpmMonoRepo } from './workspace.js';

const logger = createLogger('user', true);
logger.enable(EnableLogLevel.verbose);

class UserControl {
	private _pause = false;
	private _quit = false;

	public setPause(pause: boolean) {
		this._pause = pause;
	}
	public togglePause() {
		this._pause = !this._pause;
		logger.info`${this._pause ? '暂停' : '恢复'}状态输出`;
	}

	get pause() {
		return this._pause;
	}

	get quit() {
		return this._quit;
	}

	public setQuit() {
		this._quit = true;
	}
}

export function startUi(repo: IPnpmMonoRepo) {
	const controller = new UserControl();
	if (!process.stdin.isTTY) {
		logger.info`非交互式环境，跳过用户界面`;
		return controller;
	}

	const rl = createInterface(process.stdin, process.stderr);

	registerGlobalLifecycle(
		toDisposable(async () => {
			controller.setQuit();
			rl.close();
		}),
	);

	messageLoop(repo, controller, rl).catch((e) => {
		if (controller.quit) return;
		if (e.code === 'ABORT_ERR') {
			throw new InterruptError('SIGINT');
		}
		prettyPrintError('命令接口错误', e);
	});
	return controller;
}

async function messageLoop(repo: IPnpmMonoRepo, controller: UserControl, rl: Interface) {
	rl.setPrompt('> ');
	while (!controller.quit) {
		const line = await rl.question(`${helpText()}\n> `);

		const [cmd, ...args] = line.trim().split(/\s+/g);

		let found = false;
		for (const [name, fn] of Object.entries(commands)) {
			if (name.startsWith(cmd)) {
				try {
					await fn(repo, controller, args);
				} catch (e) {
					prettyPrintError(`命令执行错误: ${name}`, convertCaughtError(e));
				}
				found = true;
				break;
			}
		}
		if (!found) {
			console.error(`未知命令: ${cmd}`);
		}
	}
}

function helpText() {
	return '*** 帮助信息';
}

type CommandFunction = (repo: IPnpmMonoRepo, controller: UserControl, args: string[]) => void;

const commands: Record<string, CommandFunction> = {
	help() {
		console.error(helpText());
	},
	status(repo) {
		repo.printScreen();
	},
	pause(_repo, controller) {
		controller.togglePause();
	},
	async dump(repo, controller, [what]: string[]) {
		const pkg = await singleProject(repo, what);
		if (!pkg) return;

		const worker = repo._debugWorker(pkg);
		Object.assign(globalThis, { dumpWorker: worker });

		console.error(inspect(worker, { customInspect: false, colors: true }));

		logger.info`已将项目 ${pkg.name} 的 worker 对象暴露为全局变量 dumpWorker`;
		controller.setPause(true);

		// biome-ignore lint/suspicious/noDebugger: it's for debugging
		debugger;
	},
	async print(repo, _controller, [what]: string[]) {
		const pkg = await singleProject(repo, what);
		if (!pkg) return;

		const output = repo._debugGetOutput(pkg);
		if (output) {
			console.error('\n\n');
			console.error(output);
			console.error('\n\n');
		} else {
			logger.error`项目 ${pkg.name} 没有输出`;
		}
	},
	async errors(repo, _controller, [what]: string[]) {
		const errMap = repo.getErrors();
		const pkg = await singleProject(repo, what);
		if (!pkg) return;

		const err = errMap.get(pkg);
		if (err) {
			console.error('\n\n');
			console.error(err);
			console.error('\n\n');
		} else {
			logger.success`项目 ${pkg.name} 没有错误`;
		}
	},
};

async function singleProject(repo: IPnpmMonoRepo, name: string) {
	if (!name) {
		logger.error`需要指定项目`;
		return null;
	}

	const exactMatch = await repo.workspace.getPackage(name);
	if (exactMatch) {
		return exactMatch;
	}

	const packages = await repo.workspace.listPackages();
	const pkgs = packages.filter((p) => p.name?.includes(name));
	if (pkgs.length === 0) {
		logger.error`没有找到匹配的项目: ${name}`;
		return null;
	} else if (pkgs.length > 1) {
		logger.error`找到多个匹配的项目list<${pkgs.map((e) => e.name)}>`;
		return null;
	}
	return pkgs[0];
}
