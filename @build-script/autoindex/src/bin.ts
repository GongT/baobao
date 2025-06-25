import { startChokidar } from '@idlebox/chokidar';
import { createRootLogger, logger } from '@idlebox/logger';
import type { IgnoreFiles } from '@idlebox/typescript-surface-analyzer';
import { channelClient } from '@mpis/client';
import { glob } from 'glob';
import { resolve } from 'node:path';
import { parseArgs } from './common/cli.js';
import { loadConfigFile } from './common/config.js';
import { createIndex } from './common/create.js';
import { loadTsConfigJson } from './common/tsconfig-loader.js';
import { loadTypescript } from './common/typescript.js';

createRootLogger('autoindex');

async function main() {
	let outputs = '';
	logger.stream.on('data', (data) => {
		outputs += data.toString();
	});

	channelClient.start();

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
			throw logger.fatal('无法确定rootDir，请添加tsconfig.json中的compilerOptions.rootDir设置。');
		}

		logger.debug('rootDir=%s', rootDir);

		const outputFile = resolve(rootDir, context.outputFile + '.ts');

		if (!outputFile.startsWith(rootDir)) {
			throw logger.fatal(`输出文件 ${outputFile} 路径异常，离开rootDir`);
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

const context = await loadConfigFile(args, logger);
const { ts, file: tsconfigFile } = await loadTypescript(context);

if (context.watchMode) {
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
