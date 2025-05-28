import { prettyPrintError, registerGlobalLifecycle } from '@idlebox/common';
import { glob, type GlobOptionsWithFileTypesFalse } from 'glob';
import { existsSync } from 'node:fs';
import { findPackageJSON } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generatorHolder } from './common/code-generator-holder.js';
import { shutdown } from './common/lifecycle.js';
import { registerModuleLoader } from './common/module-loading-transpile.js';
import { die, Logger } from './common/output.js';
import { argv, watchMode } from './common/shared.js';
import { startWatchMode } from './common/watch-mode.js';

const logger = Logger('main');

async function main() {
	Error.stackTraceLimit = Number.MAX_SAFE_INTEGER;
	registerModuleLoader();
	registerGlobalLifecycle(generatorHolder);

	const showHelp = argv.flag(['-h', '--help']) > 0;
	if (showHelp) {
		console.log('usage: $0 [--watch] ...root-dirs');
		console.log('  --verbose: 输出部分调试信息');
		console.log('  --debug: 调试模式，输出更多信息，并把生成器的编译结果写到文件');
		console.log('  --watch: 监视模式');
		console.log('  root-dirs: 生成器所在目录，至少指定一个');
		process.exit(0);
	}

	const folders = argv.unused();
	if (folders.length === 0) {
		console.error('usage: $0 package-dir');
		process.exit(1);
	}

	const roots = new Set<string>();
	for (const project of folders) {
		const root = resolve(process.cwd(), project);
		if (!existsSync(root)) {
			die(`root folder not found: ${root}`);
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

	for (const root of roots) {
		await configure(root);
	}

	if (watchMode) {
		logger.debug('execute generators in watch mode.');

		process.on('SIGINT', () => {
			console.log('\nSIGINT received, exiting...');
			shutdown(0);
		});

		startWatchMode([...roots]);
	} else {
		logger.debug('execute generators in build mode.');

		const success = await generatorHolder.executeAll();

		await shutdown(success ? 0 : 1);
	}
}

async function configure(path: string) {
	const globOptions: GlobOptionsWithFileTypesFalse = {
		cwd: path,
		absolute: true,
		ignore: ['node_modules/**'],
	};
	const files = await glob('**/*.generator.ts', globOptions);

	await generatorHolder.configureCodeGenerators(files);
}

await main();
