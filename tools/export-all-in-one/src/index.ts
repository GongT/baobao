import * as execa from 'execa';
import { emptyDir, mkdirpSync } from 'fs-extra';
import { resolve } from 'path';
import { API_CONFIG_FILE, EXPORT_TEMP_PATH, PROJECT_ROOT } from './argParse';
import { compileIndex } from './compileIndex';
import { getOptions } from './configFile';
import { doGenerate } from './doGenerate';
import { pushApiExtractorPath } from './pushApiExtractorPath';
import { updatePackageJson } from './updatePackageJson';

if (process.argv.includes('-v')) {
	const configParseResult = getOptions();
	console.error(configParseResult.options);
}

function run(command: string, args: string[]) {
	console.log('Running %s %s', command, args.join(' '));
	const p = execa(command, args, { cwd: EXPORT_TEMP_PATH });
	p.stdout!.pipe(process.stdout);
	p.stderr!.pipe(process.stderr);
	return p;
}

pushApiExtractorPath();

Promise.resolve().then(() => {
	return emptyDir(EXPORT_TEMP_PATH);
}).then(() => {
	return doGenerate();
}).then(() => {
	return run('tsc', ['-p', EXPORT_TEMP_PATH]);
}).then(async () => {
	await mkdirpSync(resolve(PROJECT_ROOT, 'docs'));
	return run('api-extractor', ['run', '-c', API_CONFIG_FILE, '--local', '--verbose']);
}).then(() => {
	return compileIndex();
}).then(() => {
	return updatePackageJson();
}).then(() => {
	console.log('\x1B[K\x1B[38;5;10mOK\x1B[0m');
	const resultRel = './docs/package-public.d.ts';
	console.log(`You can add \x1B[38;5;14m"typings": "${resultRel}"\x1B[0m to your package.json`);
	return emptyDir(EXPORT_TEMP_PATH);
}).then(() => {
	process.exit(0);
}, (err) => {
	console.error('\x1B[K!');
	console.error(err);
	process.exit(1);
});
