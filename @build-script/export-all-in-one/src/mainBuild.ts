import { emptyDir, remove } from 'fs-extra';
import { runApiExtractor } from './actions/apiExtractor';
import { compileProject } from './actions/compileSource';
import { doGenerate } from './actions/doGenerate';
import { pushApiExtractorPath } from './actions/pushApiExtractorPath';
import { transpileIndexFile } from './actions/transpileIndexFile';
import { EXPORT_TEMP_PATH } from './inc/argParse';
import { getOptions } from './inc/configFile';
import { debug, isDebug } from './inc/debug';

if (process.argv.includes('-v')) {
	const configParseResult = getOptions();
	console.error(configParseResult.options);
}

export default async function () {
	debug('\x1Bc');
	pushApiExtractorPath();

	await emptyDir(EXPORT_TEMP_PATH);
	debug('temp dir: %s', EXPORT_TEMP_PATH);
	await doGenerate();
	debug('\x1B[38;5;14mComplete generate\x1B[0m');

	await compileProject();
	debug('\x1B[38;5;14mComplete compile project\x1B[0m');

	await runApiExtractor();
	debug('\x1B[38;5;14mComplete api extractor\x1B[0m');

	await transpileIndexFile();
	debug('\x1B[38;5;14mComplete transpile index file\x1B[0m');

	console.log('\x1B[K\x1B[38;5;10mOK\x1B[0m');
	// const resultRel = './docs/package-public.d.ts';
	// console.log(`You can add \x1B[38;5;14m"typings": "${resultRel}"\x1B[0m to your package.json`);
	if (isDebug) {
		debug('temp will not delete: %s', EXPORT_TEMP_PATH);
	} else {
		await remove(EXPORT_TEMP_PATH);
	}
}
