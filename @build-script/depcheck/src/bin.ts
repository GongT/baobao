import { ProjectConfig } from '@build-script/rushstack-config-loader';
import { startChokidar } from '@idlebox/chokidar';
import { logger, makeApplication } from '@idlebox/cli';
import { prettyFormatError, prettyPrintError, registerGlobalLifecycle, type IPackageJson } from '@idlebox/common';
import { findUpUntilSync, setExitCodeIfNot, shutdown, workingDirectory } from '@idlebox/node';
import { channelClient } from '@mpis/client';
import depcheck from 'depcheck';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

await makeApplication({ name: 'depcheck', description: '检查package.json中指定的依赖是否正常', logPrefix: '' }).simple(
	{
		usage: '',
		args: {
			'--watch -w': { flag: true, description: '监视模式（响应package.json修改）', usage: true },
		},
		help: '配置文件应位于 config/depcheck.json',
	},
	async (arg) => {
		logger.info`execute dependency checker in ${workingDirectory.cwd()}`;
		if (arg.flag(['--watch', '-w']) > 0) {
			await watch();
		} else {
			await main();
		}
		setExitCodeIfNot(0);
	},
);

interface IDepcheckConfig {
	readonly excludeFiles?: string[];
	readonly ignoreDependencies?: string[];
	readonly ignoreBinPackage?: boolean;
}

async function init() {
	const pkgPath = findUpUntilSync({ file: 'package.json', from: workingDirectory.cwd() });
	if (!pkgPath) throw new Error(`missing package.json`);

	const config = new ProjectConfig(dirname(pkgPath), undefined, logger);
	const info = config.getJsonConfigInfo('depcheck');
	if (!info.effective) {
		logger.error`配置文件不存在`;
		logger.info` * relative<${info.project.path}>`;
		logger.info` * relative<${info.rig.path}>`;
		shutdown(1);
	}

	const options = {
		ignoreBinPackage: false, // ignore the packages with bin entry
		skipMissing: false, // skip calculation of missing dependencies
		ignorePatterns: [
			// files matching these patterns will be ignored
			'*.json',
			'**/test',
			'**/tests',
			'*.test.*',
		],
		ignoreMatches: [
			// ignore dependencies that matches these globs
			'tslib',
		],
	};

	try {
		const content = config.loadSingleJson<IDepcheckConfig>('depcheck', resolve(import.meta.dirname, '../depcheck.schema.json'));
		if (content.excludeFiles) {
			options.ignorePatterns = content.excludeFiles;
		}
		if (content.ignoreDependencies) {
			options.ignoreMatches = content.ignoreDependencies;
		}
		if (content.ignoreBinPackage) {
			options.ignoreBinPackage = content.ignoreBinPackage;
		}
	} catch (e: any) {
		prettyPrintError('配置文件加载失败', e);
	}

	logger.debug`config: ${options}`;
	logger.log`配置加载完成 long<${info.effective}>`;

	return {
		packageJsonPath: pkgPath,
		projectRoot: dirname(pkgPath),
		options: options as depcheck.Options,
	} as const;
}

async function main() {
	const context = await init();

	await pass(context);
}

async function watch() {
	const context = await init();
	const watcher = startChokidar(
		async () => {
			try {
				await pass(context);
			} catch (e: any) {
				channelClient.failed('运行时发生异常', prettyFormatError(e));
			}
		},
		{
			watchingEvents: ['add', 'change', 'unlink', 'addDir'],
		},
	);

	watcher.add(context.packageJsonPath);
	registerGlobalLifecycle(watcher);

	pass(context).catch((e) => {
		channelClient.failed('运行时发生异常', prettyFormatError(e));
	});

	logger.info`监视模式已启用，等待package.json变更...`;
}

async function pass(context: Awaited<ReturnType<typeof init>>) {
	channelClient.start();

	const summary = [`${context.packageJsonPath}:`];

	const pkJson: IPackageJson = JSON.parse(readFileSync(context.packageJsonPath, 'utf-8'));

	const options: depcheck.Options = {
		...context.options,
		package: {
			dependencies: pkJson.dependencies || {},
			devDependencies: {},
			optionalDependencies: pkJson.optionalDependencies || {},
			peerDependencies: pkJson.peerDependencies || {},
		},
	};

	const results = await depcheck(context.projectRoot, options);

	for (const [name, files] of Object.entries(results.using)) {
		logger.debug`dependency "${name}" is using in ${files.length} files (seen: relative<${files[0]}>)`;
	}

	const unused = results.dependencies;
	const missing = Array.from(Object.keys(results.missing));

	if (unused.length > 0 || missing.length > 0) {
		summary.push('');

		if (unused.length) {
			summary.push('[多余] 定义但未使用的依赖:');
			for (const name of unused) {
				summary.push(`  - ${name}`);
			}
		}

		if (missing.length) {
			summary.push('[缺少] 使用但未定义的依赖:');
			for (const name of missing) {
				const first = results.missing[name][0];
				if (pkJson.devDependencies?.[name]) {
					summary.push(`  - ${name} [devDependencies] (seen: ${first})`);
				} else {
					summary.push(`  - ${name} (seen: ${first})`);
				}
			}
		}

		logger.error`depcheck检查未通过`;
		for (const line of summary) {
			logger.info(line);
		}
		channelClient.failed(`depcheck检查未通过`, summary.join('\n'));
	} else {
		logger.success`depcheck检查通过`;
		channelClient.success('depcheck检查通过');
	}
}
