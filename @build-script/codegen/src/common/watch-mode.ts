import { startChokidar, type IWatchHelper } from '@idlebox/chokidar';
import { convertCaughtError, prettyPrintError, registerGlobalLifecycle } from '@idlebox/common';
import { logger as glogger } from '@idlebox/logger';
import { globSync } from 'glob';
import type { GeneratorHolder } from './code-generator-holder.js';
import { IgnoreFiles } from './ignore-files.js';
import { shutdown } from './lifecycle.js';
import { debugMode } from './shared.js';

const logger = glogger.extend('watcher');

export function startWatchMode(generatorHolder: GeneratorHolder) {
	const watcher = createWatch((changes) => runOnce(generatorHolder, changes));

	const folders = globSync(
		generatorHolder.roots.map((p) => `${p}/**/`),
		{ ignore: ['**/node_modules/**', '**/node_modules/**'] },
	);
	watcher.add(folders);
	runOnce(generatorHolder).finally(() => {
		logger.log(`👀 启动监视模式, ${folders.length}个文件夹.`);
	});

	syncFilesToWatcher(generatorHolder, watcher);
}

async function runOnce(generatorHolder: GeneratorHolder, changes?: readonly string[]) {
	try {
		await generatorHolder.configureCodeGenerators();

		if (changes) {
			logger.info`发现文件变动: ${changes.length}`;
			if (debugMode) {
				logger.log`文件列表list<${changes}>`;
			}
			await generatorHolder.executeRelated(new Set(changes));
		} else {
			logger.info`开始执行所有生成器`;
			await generatorHolder.executeAll();
		}
	} catch (e) {
		prettyPrintError('codegen监视模式中出现未预料异常', convertCaughtError(e));
		shutdown(66);
	}
}

function syncFilesToWatcher(generatorHolder: GeneratorHolder, watcher: IWatchHelper) {
	generatorHolder.onComplete(() => {
		const watches = generatorHolder.getAllWatchingFiles();
		watcher.add(watches);

		notifyWatching(watcher);
	});
}

let notifyTimer: NodeJS.Timeout | undefined;
function notifyWatching(watcher: IWatchHelper) {
	if (!debugMode) {
		const watching = watcher.watches;
		logger.log(`👀 监视模式: ${watching.length}个文件.`);
		return;
	}

	if (notifyTimer) clearTimeout(notifyTimer);
	notifyTimer = setTimeout(() => {
		notifyTimer = undefined;

		const watching = watcher.watches;
		const notModuleCount = watching.filter((e) => !e.includes('/node_modules/')).length;

		if (logger.verbose.isEnabled) {
			const line = '='.repeat(process.stderr.columns || 80);
			console.error('\x1B[2m%s\r', line);
			logger.verbose`监视的文件list<${watching}>`;
			console.error('%s\x1B[0m', line);
		}

		logger.log(`👀 监视模式: ${watching.length}个文件 (${notModuleCount}个在当前项目内).`);
	}, 1000);
}

function createWatch(runPass: (changes: string[]) => Promise<void>) {
	const watch_ignore = new IgnoreFiles();
	watch_ignore.add('**/*.generated.ts');
	watch_ignore.add('**/.*');

	const watcher = startChokidar(runPass, {
		ignoreInitial: true,
		watchingEvents: ['add', 'change', 'unlink', 'addDir'],
		debounceMs: 1000,
		ignored: (path) => {
			const r = watch_ignore.ignore(path);
			if (r) {
				logger.debug('[ignore] %s', path);
			} else {
				// logger.verbose('[watch ] %s', path);
			}
			return r;
		},
	});

	process.on('SIGPIPE', () => {
		logger.info('\n收到SIGPIPE, 打印 chokidar 监听器...');

		logger.info('期望监听:');
		for (const e of watcher.expectedWatches) {
			if (e.includes('/node_modules/')) continue;
			logger.log(`  - ${e}`);
		}
		logger.info('实际监听:');
		for (const e of watcher.watches) {
			if (e.includes('/node_modules/')) continue;
			logger.log(`  - ${e}`);
		}
	});

	registerGlobalLifecycle(watcher);

	return watcher;
}
