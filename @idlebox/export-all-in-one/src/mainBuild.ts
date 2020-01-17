import { emptyDir, remove } from 'fs-extra';
import { runApiExtractor } from './actions/apiExtractor';
import { compileSource } from './actions/compileSource';
import { doGenerate } from './actions/doGenerate';
import { pushApiExtractorPath } from './actions/pushApiExtractorPath';
import { transpileIndexFile } from './actions/transpileIndexFile';
import { EXPORT_TEMP_PATH } from './inc/argParse';
import { getOptions } from './inc/configFile';
import { debug } from './inc/debug';

if (process.argv.includes('-v')) {
	const configParseResult = getOptions();
	console.error(configParseResult.options);
}

export default async function() {
	pushApiExtractorPath();

	await emptyDir(EXPORT_TEMP_PATH);
	await doGenerate();
	await compileSource();
	await runApiExtractor();
	await transpileIndexFile();
	console.log('\x1B[K\x1B[38;5;10mOK\x1B[0m');
	// const resultRel = './docs/package-public.d.ts';
	// console.log(`You can add \x1B[38;5;14m"typings": "${resultRel}"\x1B[0m to your package.json`);
	debug('removing temp dir: %s', EXPORT_TEMP_PATH);
	await remove(EXPORT_TEMP_PATH);
}
