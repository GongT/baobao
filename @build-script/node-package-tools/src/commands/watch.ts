import { registerGlobalLifecycle } from '@idlebox/common';
import { loadJsonFile } from '@idlebox/node-json-edit';
import { DependEmitter, prepareMonorepoDeps } from '../inc/dependency-graph.js';
import { argv, formatOptions, isVerbose, pArgS, pDesc } from '../inc/getArg.js';
import { isApplicationShuttingDown } from '../inc/global-lifecycle.js';
import { logger } from '../inc/log.js';
import { listMonoRepoPackages, monorepo } from '../inc/mono-tools.js';
import { TerminalController } from '../inc/terminal-controller.js';
import { makeOutputTester } from '../inc/watch-runner/judge.js';
import { WatchProgramRunner } from '../inc/watch-runner/program.js';
import { StateCollection } from '../inc/watch-runner/state-collect.js';

export function usageString() {
	return `${pArgS('--verbose')} ${pArgS('--keep-output')} ${pDesc('在每个项目中运行watch脚本')}`;
}
const args = {
	'--verbose': '显示所有输出，而不仅仅在编译出错时输出',
	'--keep-output': '不要清屏',
	'--server': '输出服务器模式',
	'--client': '输出客户端模式',
};

logger.debug('加载watch命令模块');

export function helpString() {
	return formatOptions(args);
}

export async function main() {
	const isKeepOutput = argv.flag('--keep-output') > 0;
	process.chdir(await monorepo.getRoot());

	const list = await listMonoRepoPackages();
	logger.debug('加载%s个项目', list.length);
	const deps = await prepareMonorepoDeps(list);
	const terminal = new TerminalController();
	const states = new StateCollection(terminal);
	const promises = [];
	const queue = new Map<string, WatchProgramRunner>();

	for (const item of list) {
		const pkgJson = await loadJsonFile(`${item.absolute}/package.json`);
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
		if (starting > MAX_CONCURRENCY_STARTING) {
			return;
		}
	}
}
