///<reference types="node"/>
import { basename, resolve } from 'path';
import { Filesystem } from '../inc/filesystem';
import { getGitName } from '../inc/gitName';
import { linkWithLog } from '../inc/linkLog';
import { locateRootRelativeToProject, readTemplate } from '../inc/template';
import { runBuildScriptInit } from '../jobs/buildScript';
import { updatePackageJson } from '../jobs/packageJson';
import { updateTsconfigJson } from '../jobs/tsconfigJson';

export default async () => {
	const gitInfo = await getGitName();

	const packageJson = await updatePackageJson(gitInfo);
	const monorepoMode = !!packageJson.monorepo;

	const projectBase = basename(packageJson.name);

	const fs = new Filesystem(CONTENT_ROOT);
	// base config
	fs.mergeIgnore('.gitignore', readTemplate('gitignore'));
	fs.mergeIgnore('.npmignore', readTemplate('npmignore'));
	fs.overwrite('.editorconfig', readTemplate('editorconfig'));
	fs.placeFile('LICENSE', license(gitInfo.full));
	fs.placeFile('README.md', `# ${projectBase}`);

	// typescript
	await updateTsconfigJson();

	if (!monorepoMode) {
		// idea
		fs.placeFile(`.idea/${basename(CONTENT_ROOT)}.iml`, readTemplate('idea/idea.iml'));
		await linkWithLog(
			await locateRootRelativeToProject('.idea/codeStyles', 'package/idea/codeStyles'),
			resolve(CONTENT_ROOT, '.idea/codeStyles'),
		);
		fs.placeFile('.idea/misc.xml', readTemplate('idea/misc.xml'));
		fs.placeFile('.idea/vcs.xml', readTemplate('idea/vcs.xml'));
		fs.placeFile('.idea/modules.xml', readTemplate('idea/modules.xml').replace(/{NAME}/g, basename(CONTENT_ROOT)));

		// create git repo
		if (!fs.exists('.git')) {
			fs.exec('git init');
			fs.exec(`git remote add origin git@github.com:${gitInfo.user}/${projectBase}.git`);
			fs.exec('git add .');
		}
	}

	if (packageJson.name !== '@idlebox/build-script') {
		await runBuildScriptInit();
	}

	console.log('Yes.');
};

function license(name: string) {
	const content = readTemplate('LICENSE');
	return content.replace('{WHO}', name);
}
