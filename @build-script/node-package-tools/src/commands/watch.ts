import { registerGlobalLifecycle } from '@idlebox/common';
import { loadJsonFile } from '@idlebox/node-json-edit';
import { DependEmitter } from '../inc/dependency-graph.js';
import { argv, formatOptions, pArgS, pDesc } from '../inc/getArg.js';
import { isApplicationShuttingDown } from '../inc/global-lifecycle.js';
import { debug } from '../inc/log.js';
import { getProjectRoot, listMonoRepoPackages } from '../inc/mono-tools.js';
import { TerminalController } from '../inc/terminal-controller.js';
import { makeOutputTester } from '../inc/watch-runner/judge.js';
import { WatchProgramRunner } from '../inc/watch-runner/program.js';
import { StateCollection } from '../inc/watch-runner/state-collect.js';

export function usageString() {
	return `${pArgS('--verbose')} ${pArgS('--keep-output')} ${pDesc('在每个项目中运行watch脚本')}`;
}
const args = {
	'--verbose': '显示所有输出，而不仅在编译出错时输出',
	'--keep-output': '不要清屏',
	'--server': '输出服务器模式',
	'--client': '输出客户端模式',
};
export function helpString() {
	return formatOptions(args);
}

export async function main() {
	const isVerbose = argv.flag('--verbose') > 0;
	const isKeepOutput = argv.flag('--keep-output') > 0;
	process.chdir(await getProjectRoot());

	const list = await listMonoRepoPackages();
	debug('加载%s个项目', list.length);
	const terminal = new TerminalController();
	const states = new StateCollection(terminal);
	const deps = new DependEmitter();
	const promises = [];
	const queue = new Map<string, WatchProgramRunner>();

	for (const item of list) {
		deps.addNode(item.name, [...item.dependencies, ...item.devDependencies]);

		const pkgJson = await loadJsonFile(`${item.absolute}/package.json`);
		if (!pkgJson.scripts?.watch || pkgJson.scripts.watch === 'true') {
			deps.setComplated(item.name);
			states.addDummy(item.name);
			debug('跳过%s: 没有watch脚本', item.name);
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

	deps.detectLoop();
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
			debug('确实已经全都完成了');
		} else if (check.building.length === 0) {
			debug('死了啦，都是你害的啦');
			throw new Error(`发现死锁，剩余${check.pending.length}个项目，但没有可以启动的`);
		} else {
			debug('没有可以启动的项目: %s个正在运行: %s', check.building.length, check.building.join(', '));
		}
		return;
	}

	for (const { process, item } of start) {
		debug('启动 [concurrent=%s]: %s', starting, item);

		const ev = process.onBuildStop((success) => {
			starting--;
			if (success && !isApplicationShuttingDown) {
				deps.setComplated(item);
				debug('首次完成: %s (%s)', item, success ? 'success' : 'failed');
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
