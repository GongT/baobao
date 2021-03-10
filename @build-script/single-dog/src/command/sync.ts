///<reference types="node"/>
import { basename } from 'path';
import { relativePath } from '@idlebox/node';
import { loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/node-json-edit';
import { getPackageManager } from 'unipm';
import { Filesystem } from '../inc/filesystem';
import { getGitName } from '../inc/gitName';
import { linkWithLog } from '../inc/linkLog';
import { spawnSyncLog } from '../inc/spawn';
import { locateRootRelativeToProject, readTemplate } from '../inc/template';
import { runBuildScriptInit } from '../jobs/buildScript';
import { runExportAllInOne } from '../jobs/exportAll';
import { detectMonoRepo, initArgs, reloadPackageJson, updatePackageJson } from '../jobs/packageJson';
import { updateTsconfigJson } from '../jobs/tsconfigJson';

export default async () => {
	const mode = await initArgs();

	const gitInfo = await getGitName();

	await updatePackageJson(mode);

	let packageJson = await reloadPackageJson();

	const projectBase = basename(packageJson.name);

	const fs = new Filesystem(CONTENT_ROOT);
	// base config
	fs.mergeIgnore('.npmignore', readTemplate('npmignore'));
	if (mode.appMode) {
		fs.placeFile('bin.js', readTemplate('bin.js'), '0755');
	}
	fs.placeFile('LICENSE', license(gitInfo.full));
	fs.placeFile('README.md', `# ${projectBase}`);

	// typescript
	await updateTsconfigJson(mode);

	if (packageJson.name !== '@build-script/builder') {
		await runBuildScriptInit(fs, mode);
	}
	if (mode.libMode) {
		runExportAllInOne('src/tsconfig.json');
	}

	packageJson = await reloadPackageJson();

	const monorepo = await detectMonoRepo();
	if (monorepo) {
		const rootFs = new Filesystem(monorepo.root);
		await addNormalRoot(rootFs);

		if (monorepo.type === 'rush') {
			await addRushRoot(rootFs);
		} else {
			await addSimpleRoot(rootFs);
		}
	} else {
		await addNormalRoot(fs);
		await addSimpleRoot(fs);

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

async function addNormalRoot(fs: Filesystem) {
	fs.placeFile(`.vscode/extensions.json`, readTemplate('vscode/extensions.json'));
	fs.placeFile(`.vscode/import-sorter.json`, readTemplate('vscode/import-sorter.json'));
	fs.placeFile(`.vscode/settings.json`, readTemplate('vscode/settings.json'));

	fs.mergeIgnore('.gitignore', readTemplate('gitignore'));
	fs.overwrite('.editorconfig', readTemplate('editorconfig'));
	fs.placeFile('.gitattributes', readTemplate('gitattributes'));
	fs.mergeIgnore('.prettierignore', readTemplate('prettierignore'));
}

async function addRushRoot(fs: Filesystem) {
	fs.placeFile('common/autoinstallers/rush-prettier/.gitignore', readTemplate('rush-ai-gitignore'));
	fs.placeFile('common/autoinstallers/rush-prettier/package.json', readTemplate('rush-pretty-package.json'));
	fs.placeFile('common/git-hooks/pre-commit', readTemplate('rush-pretty-pre-commit'));

	fs.placeFile('common/autoinstallers/single-doge/.gitignore', readTemplate('rush-ai-gitignore'));
	fs.placeFile('common/autoinstallers/single-doge/package.json', readTemplate('rush-single-package.json'));

	const pm = await getPackageManager({ cwd: CONTENT_ROOT, ask: false });
	await pm.invokeCli('update-autoinstaller', '--name', 'rush-prettier');
	await pm.invokeCli('update-autoinstaller', '--name', 'single-doge');

	await linkWithLog(
		await relativePath(
			fs.ROOT,
			fs.resolve(
				'common/autoinstallers/single-doge/node_modules/@build-script/single-dog-asset/package/prettierrc.js'
			)
		),
		fs.resolve('.prettierrc.js')
	);

	const rushCmdlines = await loadJsonFileIfExists(fs.resolve('common/config/rush/command-line.json'), {});
	if (!rushCmdlines.commands) {
		rushCmdlines.commands = [];
	}
	const mergeTarget: any[] = rushCmdlines.commands;

	const commands = [
		{
			commandKind: 'global',
			name: 'pretty',
			summary: '运行“pretty-quick”命令，格式化所有文件',
			autoinstallerName: 'rush-prettier',
			safeForSimultaneousRushProcesses: true,
			shellCommand: 'pretty-quick',
		},
	];
	for (const item of commands) {
		const foundOld = mergeTarget.findIndex((ele) => {
			return ele.name === item.name;
		});
		if (foundOld === -1) {
			mergeTarget.push(item);
		} else {
			Object.assign(mergeTarget[foundOld], item);
		}
	}

	await writeJsonFileBack(rushCmdlines);
}
async function addSimpleRoot(fs: Filesystem) {
	await linkWithLog(
		await locateRootRelativeToProject(fs.resolve('.prettierrc.js'), 'package/prettierrc.js'),
		fs.resolve('.prettierrc.js')
	);
}
