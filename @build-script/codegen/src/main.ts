import { UsageError, prettyPrintError, registerGlobalLifecycle } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { existsSync } from 'node:fs';
import { findPackageJSON } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { GeneratorHolder } from './common/code-generator-holder.js';
import { ImportExecuter } from './common/executer.import.js';
import { SpawnExecuter } from './common/executer.spawn.js';
import { shutdown } from './common/lifecycle.js';
import { remainingArgs, showHelp, watchMode } from './common/shared.js';
import { startWatchMode } from './common/watch-mode.js';

export async function main() {
	Error.stackTraceLimit = Number.MAX_SAFE_INTEGER;

	if (showHelp) {
		console.log('usage: $0 [--watch] ...root-dirs');
		console.log('  --verbose: 输出部分调试信息');
		console.log('  --debug: 调试模式，输出更多信息，并把生成器的编译结果写到文件');
		console.log('  --watch: 监视模式');
		console.log('  root-dirs: 生成器所在目录，至少指定一个');
		process.exit(0);
	}

	const folders = remainingArgs.slice();
	if (folders.length === 0) {
		console.error('usage: $0 package-dir');
		process.exit(1);
	}

	registerNodejsExitHandler();

	const roots = new Set<string>();
	for (const project of folders) {
		const root = resolve(process.cwd(), project);
		if (!existsSync(root)) {
			throw new UsageError(`root folder not found: ${root}`);
		}
		roots.add(root);

		let pkgFile: string | undefined;
		try {
			pkgFile = findPackageJSON(pathToFileURL(root));
		} catch (e) {
			prettyPrintError(`findPackageJSON(${root})`, e as Error);
			return shutdown(1);
		}
		if (!pkgFile) {
			throw new Error(`failed find package.json from ${root}`);
		}
	}

	const generatorHolder = new GeneratorHolder([...roots.values()], watchMode ? SpawnExecuter : ImportExecuter);
	registerGlobalLifecycle(generatorHolder);

	if (watchMode) {
		logger.info`监视模式运行`;

		process.exitCode = 0;
		startWatchMode(generatorHolder);
	} else {
		logger.info`非监视模式运行`;

		await generatorHolder.configureCodeGenerators();
		const result = await generatorHolder.executeAll();

		await shutdown(result.errors.length);
	}
}
