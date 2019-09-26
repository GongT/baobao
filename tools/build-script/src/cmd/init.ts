import { insertKeyAlphabet, loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { exists } from '@idlebox/platform';
import { createFile, readFile, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { fatalError } from '../cmd-loader';
import { BuildContext } from '../common/buildContext';
import { createBuildContext, loaderProjectPath } from '../common/buildContextInstance';

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
	if (ctx.isProjectJsonExists()) {
		fatalError('project already init with build-script.');
	}
	console.log('initializing...');

	await modifyPackageJson(ctx);
	await addIgnoreFile(ctx);
	await createBuildJson(ctx);
	await createGulpFile(ctx);

	console.log('You may need to update packages with package manager.');
}

async function addIgnoreFile(ctx: BuildContext) {
	const ignoreFile = resolve(ctx.projectRoot, '.npmignore');
	if (!await exists(ignoreFile)) {
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
	lines.push('### build-script ###', 'build-script.json', 'Gulpfile.js', '');
	await writeFile(ignoreFile, lines.join('\n'));
}

async function modifyPackageJson(ctx: BuildContext) {
	const packageJson = await loadJsonFile(resolve(ctx.projectRoot, 'package.json'));

	if (!packageJson.scripts) {
		packageJson.scripts = {};
	}
	addOrFail(packageJson.scripts, 'build', 'build-script build');
	addOrFail(packageJson.scripts, 'clean', 'build-script clean');
	addOrFail(packageJson.scripts, 'distclean', 'build-script distclean');
	addOrFail(packageJson.scripts, 'prepack', 'build-script rebuild');
	addOrFail(packageJson.scripts, 'publish', 'build-script publish');
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
	ctx.registerAlias('watch-ts', 'tsc --pretty -w -p src');
	ctx.registerAlias('cleanup-lib', 'rimraf lib');
	ctx.registerAlias('yarn-publish', 'yarn publish --registry https://registry.npmjs.org --access=public');
	ctx.registerAlias('upgrade-node-modules', 'npm-check-updates --update --packageFile ./package.json');
	ctx.registerAlias('run-test', 'echo No test command set.');
	ctx.registerAlias('git-clean-all', 'git clean -f -d -X -e node_modules');
	ctx.registerAlias('git-clean', 'git clean -f -d -X -e node_modules');

	ctx.addAction('build', ['build-ts']).title = 'Build project';
	ctx.addAction('distclean', ['git-clean-all']).title = 'Delete git ignore files';
	ctx.addAction('clean', ['git-clean']).title = 'Delete git ignore files (without node_modules)';
	ctx.addAction('rebuild', ['cleanup-lib', '@build']).title = 'Prepare for publish package';
	ctx.addAction('publish', ['yarn-publish'], ['rebuild']).title = 'Publish package';
	ctx.addAction('test', ['run-test'], ['build']).title = 'Run test';
	ctx.addAction('upgrade', ['upgrade-node-modules']).title = 'Do project dependency upgrade';
	ctx.addAction('watch', ['watch-ts']).title = 'Watch mode build project';

	await ctx.writeBack();
}

async function createGulpFile(_: BuildContext) {
	const Gulpfile = resolve(loaderProjectPath, 'Gulpfile.js');
	if (await exists(Gulpfile)) {
		return;
	}

	await writeFile(Gulpfile, `const gulp = require('gulp');
const { loadToGulp } = require('@idlebox/build-script');
loadToGulp(gulp, __dirname);
`);

	console.log('Done.');
}

export const usage = 'Init build-script related files in current directory';
