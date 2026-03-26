import { startChokidar, type IWatchHelper } from '@idlebox/chokidar';
import { createRootLogger, EnableLogLevel, logger, NodejsOutput } from '@idlebox/logger';
import { CollectingStream, registerNodejsExitHandler, shutdown } from '@idlebox/node';
import type { IgnoreFiles } from '@idlebox/typescript-surface-analyzer';
import { channelClient } from '@mpis/client';
import { glob } from 'glob';
import { resolve } from 'node:path';
import { PassThrough } from 'node:stream';
import { parseArgs } from './common/cli.js';
import { createContext } from './common/config.js';
import { createIndex } from './common/create.js';
import { loadTsConfigJson } from './common/tsconfig-loader.js';
import { loadTypescript } from './common/typescript.js';

const pipeEntry = new PassThrough();
pipeEntry.pipe(process.stderr);
const captureStream = new CollectingStream();
pipeEntry.pipe(captureStream);

createRootLogger(
	'autoindex',
	EnableLogLevel.auto,
	new NodejsOutput({
		stream: pipeEntry,
		colorEnabled: process.stderr.isTTY,
	}),
);
registerNodejsExitHandler(logger);

let tsData: Awaited<ReturnType<typeof loadTypescript>>;
async function loadTypescriptOnce() {
	if (!tsData) {
		tsData = await loadTypescript(context);
	}
	return tsData;
}

async function main() {
	captureStream.clear();
	channelClient.start();

	const { ts, file: tsconfigFile } = await loadTypescriptOnce();

	try {
		const { command, configFiles } = loadTsConfigJson(ts, tsconfigFile, {
			exclude: context.excludePatterns,
			include: context.includePatterns,
		});

		if (context.verboseMode) {
			logger.debug`options: ${command.options}`;
			logger.debug`command:`;
			for (const file of command.fileNames) {
				logger.debug`  - ${file}`;
			}
		}

		const rootDir = command.options.rootDir;
		if (!rootDir) {
			logger.error`无法确定rootDir，请添加tsconfig.json中的compilerOptions.rootDir设置。`;
			shutdown(1);
		}

		logger.debug`rootDir=${rootDir}`;

		const outputFile = resolve(rootDir, `${context.outputFile}.ts`);

		if (!outputFile.startsWith(rootDir)) {
			logger.error`输出文件 long<${outputFile}> 路径异常，离开rootDir`;
			shutdown(1);
		}

		const r = await createIndex({
			ts,
			project: command,
			outputFileAbs: outputFile,
			logger,
			absoluteImport: context.absoluteImport,
			stripTags: context.stripTags,
			extraExcludes: context.excludePatterns,
			banner: context.banner,
		});

		r.watchFiles.push(...configFiles);

		channelClient.success('autoindex 成功完成', captureStream.getOutput());
		return r;
	} catch (e) {
		channelClient.failed('autoindex 失败', captureStream.getOutput());
		throw e;
	}
}

const args = await parseArgs();
logger.debug`arguments: ${args}`;

const context = await createContext(args, logger);

if (!context.project) {
	logger.warn`本项目没有指定任务！`;
	empty_watching();
} else if (context.watchMode) {
	let lastExecuteIgnore: IgnoreFiles | undefined;
	async function exec() {
		const r = await main();

		lastExecuteIgnore = r.ignores;

		watcher.add(r.watchFiles);

		check_empty_watching(watcher);
	}

	function testAndRun(changes: readonly string[]) {
		if (lastExecuteIgnore && lastExecuteIgnore.filter(changes).length === 0) {
			logger.debug`${changes.length} file changes, but all ignored.`;
			return;
		}
		logger.log`rebuild due to ${changes.length} file changes: ${changes[0]}`;
		return exec();
	}

	const watcher = startChokidar(testAndRun, {
		watchingEvents: ['add', 'change', 'unlink', 'addDir'],
	});

	const content = await glob('**/', { absolute: true, cwd: context.project, ignore: ['**/node_modules/**'] });
	watcher.add(content);

	logger.verbose`executing mode: watch.`;
	await exec();
} else {
	logger.verbose`executing mode: onepass.`;
	await main();
	shutdown(0);
}

let timeout: NodeJS.Timeout | undefined;
/**
 * 等待chokidar调用完系统监听，再检查是否一个文件都没有
 */
function check_empty_watching(watcher: IWatchHelper) {
	if (watcher.expectedWatches.length) return;
	if (timeout) clearTimeout(timeout);

	logger.debug`疑似没有文件，等待5秒钟确认...`;
	timeout = setTimeout(() => {
		timeout = undefined;
		if (watcher.empty) {
			logger.warn`没有监听到任何文件！`;
			empty_watching();
		}
	}, 5000);
}

function empty_watching() {
	if (context.watchMode) {
		setInterval(() => {
			// x
		}, 10000);
	}

	channelClient.success('无事可做');
}
