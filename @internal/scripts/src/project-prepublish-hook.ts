import { createRootLogger } from '@idlebox/logger';
import { executeProjectCheck } from './common/check-project.js';
import { readPackageJson, writeBack } from './common/package-json.js';
import {
	ensureExportsPackageJson,
	makeInformationalFields,
	mirrorExportsAndMain,
	removeExportsTypes,
	removeLoaderFromExportsAndBin,
	sanitizePackageJson,
	writeNpmFiles,
} from './common/steps.js';

createRootLogger('prepublish');

await readPackageJson();

await executeProjectCheck();

makeInformationalFields();
sanitizePackageJson();
removeExportsTypes();
removeLoaderFromExportsAndBin();

// latest
mirrorExportsAndMain();
ensureExportsPackageJson();

await writeBack();
writeNpmFiles();
