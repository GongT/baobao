import { argv } from '@idlebox/args/default';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { overrideImportFile } from '@idlebox/native-executer';
import { existsSync, registerNodejsGlobalTypedErrorHandler, shutdown } from '@idlebox/node';
import { ExecaError } from 'execa';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { listPnpm } from './common/monorepo.js';
import { packageJson, readPackageJson, writeBackPackageJson } from './common/package-json.js';
import { currentProject } from './common/paths/current.js';
import {
	deleteDevelopmentFields,
	ensureExportsPackageJson,
	executePreBuild,
	makeInformationalFields,
	mirrorExportsAndMain,
	removeExportsTypes,
	removeLoaderFromExportsAndBin,
	removeLowlevels,
	rewriteTsconfig,
	writeNpmFiles,
} from './common/steps.js';

const debug = argv.flag(['--debug', '-d']);
createRootLogger(
	'prepublish-hook',
	(process.env.DEBUG_LEVEL as any) || (debug > 1 ? EnableLogLevel.verbose : debug > 0 ? EnableLogLevel.debug : EnableLogLevel.auto),
);

registerNodejsGlobalTypedErrorHandler(ExecaError, (err) => {
	logger.error`执行命令失败: commandline<${err.command}>\n    wd: long<${err.cwd}>`;
	shutdown(1);
});

process.exitCode = 0;
logger.log`这是预发布钩子`;

const currentPackagePath = resolve(currentProject, 'package.json');
logger.debug`处理 long<${currentPackagePath}>`;

const list = await listPnpm();
const found = list.find((p) => {
	return p.path === currentProject;
});

if (found) {
	logger.error`此文件不允许在实际项目中执行！`;
	shutdown(1);
}

await readPackageJson();

await executePreBuild();

makeInformationalFields();
removeExportsTypes();
removeLoaderFromExportsAndBin();
removeLowlevels();

mirrorExportsAndMain();
ensureExportsPackageJson();
deleteDevelopmentFields();

// 执行自定义的 prepublishHook: 钩子
const hooks = Object.keys(packageJson['scripts'] || {}).filter((name) => name.startsWith('prepublishHook:'));
if (hooks.length) {
	const entryFile = pathToFileURL(resolve(import.meta.dirname, 'exports.ts'));
	const hiddenFile = pathToFileURL(resolve(import.meta.dirname, '../exports.js'));
	overrideImportFile(hiddenFile, entryFile);
	for (const name of hooks) {
		const script = packageJson['scripts'][name];
		delete packageJson['scripts'][name];

		const absoluteFile = resolve(currentProject, script);
		if (!existsSync(absoluteFile)) {
			logger.error`预发布钩子脚本 ${name} 文件不存在！ (relative<${absoluteFile}>)`;
			shutdown(1);
		}

		logger.info`执行自定义 prepublishHook: 钩子 (${name} -> relative<${absoluteFile}>)`;
		await import(absoluteFile);
	}
} else {
	logger.log`没有自定义 prepublishHook: 钩子`;
}

await writeBackPackageJson();
writeNpmFiles();

await rewriteTsconfig();

if (process.exitCode === 0) {
	logger.success`预发布钩子结束了`;
} else {
	logger.error`未能通过发布前检查（见前面的日志）`;
}
shutdown(0);
