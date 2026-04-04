import { logger } from '@idlebox/logger';
import { registerNodejsGlobalTypedErrorHandler, shutdown } from '@idlebox/node';
import { ExecaError } from 'execa';
import { resolve } from 'node:path';
import { listPnpm } from './common/monorepo.js';
import { readPackageJson, writeBackPackageJson } from './common/package-json.js';
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
import { checkDocumentExists, checkWorkspaceDependencies, executePrepublishHooks } from './common/steps2.js';

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

await checkWorkspaceDependencies();

await checkDocumentExists();

await executePrepublishHooks();

await writeBackPackageJson();
writeNpmFiles();

await rewriteTsconfig();

if (process.exitCode === 0) {
	logger.success`预发布钩子结束了`;
} else {
	logger.error`未能通过发布前检查（见前面的日志）`;
}
shutdown(0);
