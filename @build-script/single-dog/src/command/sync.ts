///<reference types="node"/>
import { basename, resolve } from 'path';
import { Filesystem } from '../inc/filesystem';
import { getGitName } from '../inc/gitName';
import { linkWithLog } from '../inc/linkLog';
import { spawnSyncLog } from '../inc/spawn';
import { locateRootRelativeToProject, readTemplate } from '../inc/template';
import { runBuildScriptInit } from '../jobs/buildScript';
import { runExportAllInOne } from '../jobs/exportAll';
import { initArgs, updatePackageJson, reloadPackageJson } from '../jobs/packageJson';
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
		packageJson = await reloadPackageJson();
	}

	if (mode.libMode) {
		runExportAllInOne('src/tsconfig.json');
		packageJson = await reloadPackageJson();
	}

	if (!monorepoMode) {
		fs.placeFile(`.idea/${basename(CONTENT_ROOT)}.iml`, readTemplate('idea/idea.iml'));
		await linkWithLog(
			await locateRootRelativeToProject('.idea/codeStyles', 'package/idea/codeStyles'),
			resolve(CONTENT_ROOT, '.idea/codeStyles')
		);
		fs.placeFile('.idea/misc.xml', readTemplate('idea/misc.xml'));
		fs.placeFile('.idea/vcs.xml', readTemplate('idea/vcs.xml'));
		fs.placeFile('.idea/modules.xml', readTemplate('idea/modules.xml').replace(/{NAME}/g, basename(CONTENT_ROOT)));

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
