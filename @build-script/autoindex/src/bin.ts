import { startChokidar } from '@idlebox/chokidar';
import { createRootLogger, logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import type { IgnoreFiles } from '@idlebox/typescript-surface-analyzer';
import { channelClient } from '@mpis/client';
import { glob } from 'glob';
import { resolve } from 'node:path';
import { parseArgs } from './common/cli.js';
import { createContext } from './common/config.js';
import { createIndex } from './common/create.js';
import { loadTsConfigJson } from './common/tsconfig-loader.js';
import { loadTypescript } from './common/typescript.js';

createRootLogger('autoindex');

let tsData: Awaited<ReturnType<typeof loadTypescript>>;
async function loadTypescriptOnce() {
	if (!tsData) {
		tsData = await loadTypescript(context);
	}
	return tsData;
}

async function main() {
	let outputs = '';
	logger.stream.on('data', (data) => {
		outputs += data.toString();
	});

	channelClient.start();

	const { ts, file: tsconfigFile } = await loadTypescriptOnce();

	try {
		const { command, configFiles } = loadTsConfigJson(ts, tsconfigFile, {
			exclude: context.excludePatterns,
			include: context.includePatterns,
		});

		if (context.verboseMode) {
			logger.debug('options:', command.options);
			logger.debug('command:');
			for (const file of command.fileNames) {
				logger.debug('  - %s', file);
			}
		}

		const rootDir = command.options.rootDir;
		if (!rootDir) {
			logger.error('无法确定rootDir，请添加tsconfig.json中的compilerOptions.rootDir设置。');
			shutdown(1);
		}

		logger.debug('rootDir=%s', rootDir);

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
		});

		r.watchFiles.push(...configFiles);

		channelClient.success('autoindex success', outputs);
		return r;
	} catch (e) {
		channelClient.failed('autoindex failed', outputs);
		throw e;
	}
}

const args = await parseArgs();
logger.debug`arguments: ${args}`;

const context = await createContext(args, logger);

if (!context.project) {
	logger.log`没有任务需要执行`;
	if (context.watchMode) {
		setInterval(() => {
			// x
		}, 10000);
	}

	channelClient.success('no task to execute');
} else if (context.watchMode) {
	let lastExecuteIgnore: IgnoreFiles | undefined;
	async function exec() {
		const r = await main();

		lastExecuteIgnore = r.ignores;

		watcher.add(r.watchFiles);
	}

	function testAndRun(changes: readonly string[]) {
		if (lastExecuteIgnore && lastExecuteIgnore.filter(changes).length === 0) {
			logger.debug('%s file changes, but all ignored.', changes.length);
			return;
		}
		logger.log('rebuild due to %s file changes: %s', changes.length, changes[0]);
		return exec();
	}

	const watcher = startChokidar(testAndRun, {
		watchingEvents: ['add', 'change', 'unlink', 'addDir'],
	});

	const content = await glob('**/', { absolute: true, cwd: context.project, ignore: ['**/node_modules/**'] });
	watcher.add(content);

	await exec();
} else {
	await main();
}
