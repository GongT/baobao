import { createRootLogger } from '@idlebox/logger';
import {
	ensureExportsPackageJson,
	makeInformationalFields,
	mirrorExportsAndMain,
	readPackageJson,
	removeExportsTypes,
	removeLoaderFromExportsAndBin,
	sanitizePackageJson,
	writeBack,
	writeNpmFiles,
} from './common/steps.js';

createRootLogger('prepublish');

await readPackageJson();

makeInformationalFields();
sanitizePackageJson();
removeExportsTypes();
removeLoaderFromExportsAndBin();

// latest
mirrorExportsAndMain();
ensureExportsPackageJson();

await writeBack();
writeNpmFiles();
