import { startChokidar } from '@idlebox/chokidar';
import type { IgnoreFiles } from '@idlebox/typescript-surface-analyzer';
import { channelClient } from '@mpis/client';
import { glob } from 'glob';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type TypeScriptApi from 'typescript';
import { createConsoleLogger, parseArgs, printUsage } from './cli/args.js';
import { die } from './cli/output.js';
import { createIndex } from './common/create.js';
import { getTypescript, loadTsConfigJson } from './common/tsconfig-loader.js';

const context = await Promise.resolve()
	.then(parseArgs)
	.catch((e) => {
		printUsage();
		console.error('');
		console.error('');
		die(e.message);
	});

const logger = createConsoleLogger(context);
logger.debug('context', context);

let tsconfigFile: string = context.project;
if (statSync(tsconfigFile).isDirectory()) {
	tsconfigFile = resolve(tsconfigFile, 'tsconfig.json');
	if (!existsSync(tsconfigFile)) {
		die(`missing "tsconfig.json" in: ${tsconfigFile}`);
	}
} else if (!existsSync(tsconfigFile)) {
	die(`missing tsconfig: ${tsconfigFile}`);
}

if (context.absoluteImport && context.absoluteImport[0] !== '#') {
	die(`绝对导入路径必须以'#'开头: ${context.absoluteImport}`);
}

const ts: typeof TypeScriptApi = await getTypescript(tsconfigFile, logger);
logger.log('typescript version: %s', ts.version);

let outputs = '';
logger.stream.on('data', (data) => {
	outputs += data.toString();
});

async function main() {
	channelClient.start();
	outputs = '';

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
			die('无法确定rootDir，请添加tsconfig.json中的compilerOptions.rootDir设置。');
		}

		logger.debug('rootDir=%s', rootDir);

		const outputFile = resolve(rootDir, context.outputFile);

		if (!outputFile.startsWith(rootDir)) {
			die(`输出文件 ${outputFile} 路径异常，离开rootDir`);
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
