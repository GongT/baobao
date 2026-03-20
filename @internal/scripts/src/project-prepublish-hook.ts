import { argv } from '@idlebox/args/default';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { resolve } from 'node:path';
import { listPnpm } from './common/monorepo.js';
import { readPackageJson, writeBack } from './common/package-json.js';
import { currentProject } from './common/paths/current.js';
import {
	deleteDevelopmentFields,
	ensureExportsPackageJson,
	executePreBuild,
	makeInformationalFields,
	mirrorExportsAndMain,
	removeExportsTypes,
	removeLoaderFromExportsAndBin,
	rewriteTsconfig,
	writeNpmFiles,
} from './common/steps.js';

const debug = argv.flag(['--debug', '-d']);
createRootLogger(
	'prepublish-hook',
	(process.env.DEBUG_LEVEL as any) || (debug > 1 ? EnableLogLevel.verbose : debug > 0 ? EnableLogLevel.debug : EnableLogLevel.auto),
);

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

mirrorExportsAndMain();
ensureExportsPackageJson();
deleteDevelopmentFields();

await writeBack();
writeNpmFiles();

await rewriteTsconfig();

logger.log`预发布钩子结束了`;
shutdown(0);
