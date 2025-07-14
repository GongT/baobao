import { createRootLogger, logger } from '@idlebox/logger';
import { resolve } from 'node:path';
import { currentProject } from './common/constants.js';
import { readPackageJson, writeBack } from './common/package-json.js';
import {
	ensureExportsPackageJson,
	makeInformationalFields,
	mirrorExportsAndMain,
	removeExportsTypes,
	removeLoaderFromExportsAndBin,
	writeNpmFiles,
} from './common/steps.js';

createRootLogger('prepublish-hook');
logger.log`这是预发布钩子`;

const currentPackagePath = resolve(currentProject, 'package.json');
logger.debug`处理 long<${currentPackagePath}>`;

await readPackageJson();

makeInformationalFields();
removeExportsTypes();
removeLoaderFromExportsAndBin();

mirrorExportsAndMain();
ensureExportsPackageJson();

await writeBack();
writeNpmFiles();
