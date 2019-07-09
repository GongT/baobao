import { pathExists, writeFile } from 'fs-extra';
import { insertKeyAlphabet, loadJsonFile, loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/node-json-edit';
import { resolve } from 'path';
import { SELF_ROOT } from '../global';

const mySelfPackage = require(resolve(__dirname, '../../package.json'));

export default async function (path: string) {
	const packageJsonFile = resolve(path, 'package.json');
	if (!await pathExists(packageJsonFile)) {
		throw new Error('package.json is required in current directory.');
	}
	const packageData = await loadJsonFile(packageJsonFile);
	if (!packageData.name) {
		throw new Error('package.json does not contains a "name" field.');
	}

	if (!packageData.scripts) {
		insertKeyAlphabet(packageData, 'scripts', {});
	}
	const scriptList: { [id: string]: string } = packageData.scripts;
	if (!process.argv.includes('-f')) {
		const mustSetActions = ['test', 'build', 'watch', 'prepublish', 'publishPackage'];
		for (const item of mustSetActions) {
			if (scriptList[item] && !('' + scriptList[item]).startsWith('build-script-call ')) {
				throw new Error(`Field "scripts.${item}" is exists, refuse to continue (set -f to override).`);
			}
		}
	}

	const registerWithlog = function (field: string, value: any) {
		console.log(' - register script: %s', field);
		insertKeyAlphabet(scriptList, field, 'build-script-call ' + value);
	};
	registerWithlog('test', 'test');
	registerWithlog('build', 'build');
	registerWithlog('watch', 'watch');
	registerWithlog('prepublish', 'prepublish');
	registerWithlog('publishPackage', 'publish');

	if (!packageData.dependencies) {
		packageData.dependencies = {};
	}
	if (!packageData.devDependencies) {
		packageData.devDependencies = {};
	}
	console.log(' - add devDependencies: %s', mySelfPackage.name);
	packageData.devDependencies[mySelfPackage.name] = '^' + mySelfPackage.version;

	console.log('write file %s', packageJsonFile);
	await writeJsonFileBack(packageData);

	const hooksFile = resolve(path, 'build-script.json');
	const schemaPath = resolve(SELF_ROOT, 'schema.json');
	const isExists = await pathExists(hooksFile);
	const hookContent: any = await loadJsonFileIfExists(hooksFile, { $schema: schemaPath });
	insertKeyAlphabet(hookContent, '$schema', schemaPath);

	const addIfNot = function (data: any, field: string, value: any) {
		if (!data[field]) {
			insertKeyAlphabet(data, field, value);
		}
	};

	addIfNot(hookContent, 'plugins', []);
	addIfNot(hookContent, 'actions', {});
	addIfNot(hookContent, 'jobs', {});

	if (!isExists) {
		addIfNot(hookContent.actions, 'prebuild', { type: 'parallel', exported: false, sequence: ['cleanOutput'] });
		addIfNot(hookContent.actions, 'compile', { type: 'parallel', exported: false, sequence: ['tsc'] });
		addIfNot(hookContent.actions, 'compile-watch', { type: 'parallel', exported: false, sequence: ['tscWatch'] });
		addIfNot(hookContent.actions, 'postbuild', { type: 'parallel', exported: false, sequence: [] });
	}

	addIfNot(hookContent.actions, 'test', { type: 'serial', exported: true, sequence: ['runTest'] });
	addIfNot(hookContent.actions, 'build', { type: 'serial', exported: true, sequence: ['@prebuild', '@compile', '@postbuild'] });
	addIfNot(hookContent.actions, 'watch', { type: 'serial', exported: true, sequence: ['@prebuild', '@compile-watch'] });
	addIfNot(hookContent.actions, 'prepublish', { type: 'serial', exported: true, sequence: ['@build'] });
	addIfNot(hookContent.actions, 'publish', { type: 'serial', exported: true, sequence: ['publish'] });

	if (!isExists) {
		addIfNot(hookContent.jobs, 'publish', ['yarn', 'publish', '--registry', 'https://registry.npmjs.org --access=public']);
		addIfNot(hookContent.jobs, 'tsc', ['tsc', '-p', 'src']);
		addIfNot(hookContent.jobs, 'tscWatch', ['tsc', '-p', 'src', '-w']);
		addIfNot(hookContent.jobs, 'cleanOutput', ['rimraf', 'lib', 'dist', 'out']);
		addIfNot(hookContent.jobs, 'runTest', ['echo', 'No test case set.']);
	}

	console.log('write file %s', hooksFile);
	await writeJsonFileBack(hookContent);

	const gulpFile = resolve(path, 'Gulpfile.js');
	if (!await pathExists(gulpFile)) {
		const gulpContent = `const gulp = require('gulp');
const { loadToGulp } = require('@idlebox/build-script');
loadToGulp(gulp);

`;
		await writeFile(gulpFile, gulpContent, { encoding: 'utf-8' });
	}
}
