import { resolve } from 'path';
import { exists } from '@idlebox/node';
import { insertKeyAlphabet, loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { createFile, readFile, writeFile } from 'fs-extra';
import { BuildContext } from '../common/buildContext';
import { createBuildContext } from '../common/buildContextInstance';

const { manifest } = require('pacote');

async function resolveNpmVersion(packageName: string) {
	console.debug('Resolving package: %s', packageName);
	return '^' + (await manifest(packageName + '@latest')).version;
}

async function addOrIgnore(packageDependency: any, packageName: string) {
	if (packageDependency[packageName]) {
		console.log(`package.json dependency "${packageName}" already set, ignore it, you may check it's update.`);
	}
	packageDependency[packageName] = await resolveNpmVersion(packageName);
}

function addOrFail(packageScripts: any, field: string, value: any) {
	if (packageScripts[field] && packageScripts[field] !== value) {
		throw new Error(`package.json script "${field}" already set and not by us, can not continue init.`);
	}
	insertKeyAlphabet(packageScripts, field, value);
}

export default async function init() {
	const ctx = createBuildContext();
	console.log('initializing...');

	await modifyPackageJson(ctx);
	await addIgnoreFile(ctx);
	await createBuildJson(ctx);

	console.log('You may need to update packages with package manager.');
}

async function addIgnoreFile(ctx: BuildContext) {
	const ignoreFile = resolve(ctx.projectRoot, '.npmignore');
	if (!(await exists(ignoreFile))) {
		await createFile(ignoreFile);
	}
	const data = await readFile(ignoreFile, 'utf-8');
	const lines = data.split(/\n/g);
	if (lines.includes('build-script.json')) {
		return;
	}
	if (!lines[lines.length - 1]) {
		lines.pop();
	}
	lines.push('### build-script ###', 'build-script.json', 'Gulpfile.*', '');
	await writeFile(ignoreFile, lines.join('\n'));
}

async function modifyPackageJson(ctx: BuildContext) {
	const packageJson = await loadJsonFile(resolve(ctx.projectRoot, 'package.json'));

	if (!packageJson.scripts) {
		packageJson.scripts = {};
	}
	addOrFail(packageJson.scripts, 'build', 'build-script build');
	addOrFail(packageJson.scripts, 'clean', 'rimraf lib');
	addOrFail(packageJson.scripts, 'distclean', 'build-script distclean');
	addOrFail(packageJson.scripts, 'prepack', 'build-script rebuild');
	addOrFail(packageJson.scripts, 'test', 'build-script test');
	addOrFail(packageJson.scripts, 'upgrade', 'build-script upgrade');
	addOrFail(packageJson.scripts, 'watch', 'build-script watch');

	if (!packageJson.devDependencies) {
		packageJson.devDependencies = {};
	}
	await addOrIgnore(packageJson.devDependencies, 'gulp');
	const mySelfPackage = require(resolve(__dirname, '../../package.json'));
	packageJson.devDependencies[mySelfPackage.name] = '^' + mySelfPackage.version;

	await writeJsonFileBack(packageJson);
}

async function createBuildJson(ctx: BuildContext) {
	ctx.registerAlias('build-ts', 'tsc -p src');
	ctx.registerAlias('watch-ts', 'tsc -w -p src');
	ctx.registerAlias('cleanup-lib', 'rimraf lib');
	ctx.registerAlias(
		'do-publish',
		'pnpm publish --no-git-checks --registry https://registry.npmjs.org --access=public'
	);
	ctx.registerAlias('upgrade-node-modules', 'npm-check-updates --update --packageFile ./package.json');
	ctx.registerAlias('run-test', '');
	ctx.registerAlias(
		'git-clean',
		'git clean -f -d -X -e !node_modules -e !node_modules/** -e !.idea -e !.idea/** -e !.vscode -e !.vscode/**'
	);

	ctx.addAction('build', ['build-ts']).title = 'Build project';
	ctx.addAction('distclean', ['git-clean']).title = 'Delete git ignore files (without node_modules)';
	ctx.addAction('clean', ['cleanup-lib']).title = 'Delete lib folder';
	ctx.addAction('rebuild', ['@build'], ['distclean']).title = 'Prepare for publish package';
	ctx.addAction('publish', ['do-publish'], ['rebuild']).title = 'Publish package (do same thing with npm publish)';
	ctx.addAction('test', ['run-test'], ['build']).title = 'Run test';
	ctx.addAction('upgrade', ['upgrade-node-modules']).title = 'Do project dependency upgrade';
	ctx.addAction('watch', ['watch-ts']).title = 'Watch mode build project';

	await ctx.writeBack();
}

export const usage = 'Init build-script related files in current directory';
