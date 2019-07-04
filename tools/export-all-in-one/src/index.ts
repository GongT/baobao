import { emptyDir } from 'fs-extra';
import { EXPORT_TEMP_PATH } from './inc/argParse';
import { compileIndex } from './actions/compileIndex';
import { getOptions } from './inc/configFile';
import { doGenerate } from './actions/doGenerate';
import { pushApiExtractorPath } from './actions/pushApiExtractorPath';
import { updatePackageJson } from './actions/updatePackageJson';
import { compileSource } from './actions/compileSource';
import { runApiExtractor } from './actions/apiExtractor';

if (process.argv.includes('-v')) {
	const configParseResult = getOptions();
	console.error(configParseResult.options);
}

pushApiExtractorPath();

Promise.resolve().then(() => {
	return emptyDir(EXPORT_TEMP_PATH);
}).then(() => {
	return doGenerate();
}).then(() => {
	return compileSource();
}).then(async () => {
	return runApiExtractor();
}).then(() => {
	return compileIndex();
}).then(() => {
	return updatePackageJson();
}).then(() => {
	console.log('\x1B[K\x1B[38;5;10mOK\x1B[0m');
	// const resultRel = './docs/package-public.d.ts';
	// console.log(`You can add \x1B[38;5;14m"typings": "${resultRel}"\x1B[0m to your package.json`);
	return emptyDir(EXPORT_TEMP_PATH);
}).then(() => {
	process.exit(0);
}, (err) => {
	console.error('\x1B[K!');
	console.error(err);
	process.exit(1);
});
