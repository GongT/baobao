import { humanDate, registerGlobalLifecycle } from '@idlebox/common';
import { argv, formatOptions, isVerbose, pArgS } from '../common/functions/cli.js';
import { isApplicationShuttingDown } from '../common/functions/global-lifecycle.js';
import { logger } from '../common/functions/log.js';
import { TerminalController } from '../common/functions/terminal-controller.js';
import { cachedPackageJson } from '../common/package-manager/package-json.js';
import { makeOutputTester } from '../common/watch-runner/judge.js';
import { WatchProgramRunner } from '../common/watch-runner/program.js';
import { StateCollection } from '../common/watch-runner/state-collect.js';
import { type DependEmitter, prepareMonorepoDeps } from '../common/workspace/dependency-graph.js';
import { createWorkspace } from '../common/workspace/workspace.js';

export function usageString() {
	return `${pArgS('--verbose')} ${pArgS('--keep-output')}`;
}
export function descriptionString() {
	return '在每个项目中运行watch脚本';
}
const args = {
	'--verbose': '显示所有输出，而不仅仅在编译出错时输出',
	'--keep-output': '不要清屏',
	'--server': '输出服务器模式',
	'--client': '输出客户端模式',
	'--silent': '目前必须设置，否则输出会乱',
};

export function helpString() {
	return formatOptions(args);
}

export async function main() {
	const isKeepOutput = argv.flag('--keep-output') > 0;

	const workspace = await createWorkspace();

	const list = await workspace.listPackages();
	logger.debug('加载%s个项目', list.length);
	const deps = await prepareMonorepoDeps(list);
	const terminal = new TerminalController();
	const states = new StateCollection(terminal);
	const promises = [];
	const queue = new Map<string, WatchProgramRunner>();

	for (const item of list) {
		const pkgJson = await cachedPackageJson(`${item.absolute}/package.json`);
		if (!pkgJson.scripts?.watch || pkgJson.scripts.watch === 'true') {
			deps.setComplated(item.name);
			states.addDummy(item.name);
			logger.debug('跳过%s: 没有watch脚本', item.name);
			continue;
		}
		const process = new WatchProgramRunner({
			title: item.name,
			cwd: item.absolute,
			commands: ['pnpm', 'run', '--silent', 'watch'],
			verbose: isVerbose,
			keepOutput: isKeepOutput,
			process: makeOutputTester(pkgJson),
		});
		queue.set(item.name, process);
		states.add(item.name, process);
		promises.push(process.join());

		process.onReport((report) => {
			if (report.success) return;

			terminal.section(`[${item.name}] ${report.message}`, report.output);
		});

		let start = Date.now();
		process.onBuildStart(() => {
			start = Date.now();
			terminal.print(`[${item.name}] 开始编译...`);
		});
		process.onBuildStop(() => {
			terminal.print(`[${item.name}] 完成编译: ${humanDate.deltaTiny(Date.now() - start)}`);
		});
	}

	triggerPass(deps, states, queue);

	await Promise.allSettled(promises);
}

const MAX_CONCURRENCY_STARTING = 5;
let starting = 0;
function triggerPass(deps: DependEmitter, states: StateCollection, queue: Map<string, WatchProgramRunner>) {
	const start = [];
	for (const item of deps.getNotCompletedLeaf()) {
		const process = queue.get(item);
		if (!process) {
			continue;
		}
		start.push({ process, item });
	}

	if (start.length === 0) {
		// debug only don't rely on this
		const check = states.getState();
		if (check.pending.length === 0) {
			logger.debug('确实已经全都完成了');
		} else if (check.building.length === 0) {
			logger.debug('死了啦，都是你害的啦');
			throw new Error(`发现死锁，剩余${check.pending.length}个项目，但没有可以启动的`);
		} else {
			logger.debug('没有可以启动的项目: %s个正在运行: %s', check.building.length, check.building.join(', '));
		}
		return;
	}

	for (const { process, item } of start) {
		if (starting > MAX_CONCURRENCY_STARTING) {
			return;
		}

		logger.debug('启动 [concurrent=%s]: %s', starting, item);

		const ev = process.onBuildStop((success) => {
			starting--;
			if (success && !isApplicationShuttingDown) {
				deps.setComplated(item);
				logger.debug('首次完成: %s (%s)', item, success ? 'success' : 'failed');
				triggerPass(deps, states, queue);
				ev.dispose();
			}
		});
		registerGlobalLifecycle(ev);

		process.start();
		queue.delete(item);

		starting++;
	}
}
