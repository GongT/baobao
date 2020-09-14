///<reference types="node"/>
import { basename, resolve } from 'path';
import { Filesystem } from '../inc/filesystem';
import { getGitName } from '../inc/gitName';
import { linkWithLog } from '../inc/linkLog';
import { spawnSyncLog } from '../inc/spawn';
import { locateRootRelativeToProject, readTemplate } from '../inc/template';
import { runBuildScriptInit } from '../jobs/buildScript';
import { runExportAllInOne } from '../jobs/exportAll';
import { initArgs, reloadPackageJson, updatePackageJson } from '../jobs/packageJson';
import { updateTsconfigJson } from '../jobs/tsconfigJson';

export default async () => {
	const mode = await initArgs();

	const gitInfo = await getGitName();

	await updatePackageJson(mode);

	let packageJson = await reloadPackageJson();
	const monorepoMode = !!packageJson.monorepo;

	const projectBase = basename(packageJson.name);

	const fs = new Filesystem(CONTENT_ROOT);
	// base config
	fs.mergeIgnore('.gitignore', readTemplate('gitignore'));
	fs.mergeIgnore('.npmignore', readTemplate('npmignore'));
	fs.overwrite('.editorconfig', readTemplate('editorconfig'));
	if (mode.appMode) {
		fs.placeFile('bin.js', readTemplate('bin.js'), '0755');
	}
	fs.placeFile('LICENSE', license(gitInfo.full));
	fs.placeFile('README.md', `# ${projectBase}`);
	fs.placeFile('.gitattributes', readTemplate('gitattributes'));
	await linkWithLog(
		await locateRootRelativeToProject('.prettierrc.js', 'package/prettierrc.js'),
		resolve(CONTENT_ROOT, '.prettierrc.js')
	);
	fs.mergeIgnore('.prettierignore', readTemplate('prettierignore'));

	// typescript
	await updateTsconfigJson(mode);

	if (packageJson.name !== '@build-script/builder') {
		await runBuildScriptInit(fs, mode);
	}
	if (mode.libMode) {
		runExportAllInOne('src/tsconfig.json');
	}

	packageJson = await reloadPackageJson();

	if (!monorepoMode) {
		fs.placeFile(`.vscode/extensions.json`, readTemplate('vscode/extensions.json'));
		fs.placeFile(`.vscode/import-sorter.json`, readTemplate('vscode/import-sorter.json'));
		fs.placeFile(`.vscode/settings.json`, readTemplate('vscode/settings.json'));

		// create git repo
		if (!fs.exists('.git')) {
			spawnSyncLog('git', ['init']);
			spawnSyncLog('git', ['add', '.']);
		}
	}

	console.log('Yes.');
};

function license(name: string) {
	const content = readTemplate('LICENSE');
	return content.replace('{WHO}', name);
}
