import { getOptions } from './inc/configFile';
import { pushApiExtractorPath } from './actions/pushApiExtractorPath';
import { emptyDir } from 'fs-extra';
import { EXPORT_TEMP_PATH } from './inc/argParse';
import { doGenerate } from './actions/doGenerate';
import { compileSource } from './actions/compileSource';
import { runApiExtractor } from './actions/apiExtractor';
import { compileIndex } from './actions/compileIndex';

if (process.argv.includes('-v')) {
	const configParseResult = getOptions();
	console.error(configParseResult.options);
}

export default async function () {
	pushApiExtractorPath();

	await emptyDir(EXPORT_TEMP_PATH);
	await doGenerate();
	await compileSource();
	await runApiExtractor();
	await compileIndex();
	console.log('\x1B[K\x1B[38;5;10mOK\x1B[0m');
	// const resultRel = './docs/package-public.d.ts';
	// console.log(`You can add \x1B[38;5;14m"typings": "${resultRel}"\x1B[0m to your package.json`);
	await emptyDir(EXPORT_TEMP_PATH);
}
