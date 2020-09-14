import { exists, PathEnvironment } from '@idlebox/node';
import { tmpdir } from 'os';
import { basename, resolve } from 'path';
import { decompressTargz } from './decompress';
import { detectRegistry } from './detectRegistry';
import { downloadIfNot } from './downloadIfNot';
import { getArg } from './getArg';
import { getVersionCached } from './getVersionCached';
import { gitChange, gitInit } from './git';
import { increaseVersion } from './increaseVersion';
import { errorLog, log } from './log';
import { packCurrentVersion } from './package';
import { prepareWorkingFolder } from './prepareWorkingFolder';

function help() {
	console.error(`Usage: detect-package-change --registry ??? --dist-tag ??? --package ??? --bump --quiet
	registry: default to use system .npmrc
	dist-tag: default to "latest"
	package: default to ./ (this folder contains package.json)
	bump: increase patch version in package.json if change detected
	quiet: don't print verbose message
`);
}

export async function main(argv: string[]) {
	if (argv.includes('-h') || argv.includes('--help')) {
		help();
		return 22;
	}

	process.env.LANG = 'C.utf8';

	const autoInc = argv.includes('--bump');
	const packagePath = resolve(process.cwd(), getArg('--package', './'));
	log('working at %s', packagePath);

	console.error('before', process.env.PATH);
	const p = new PathEnvironment();
	console.error('after 1', process.env.PATH);
	p.add(resolve(packagePath, 'node_modules/.bin'));
	p.add(resolve(process.argv0, '..'));
	console.error('after 2', process.env.PATH);
	process.env.LANG = 'C.UTF-8';
	process.env.LANGUAGE = 'C.UTF-8';
	for (const l in process.env) {
		if (l.startsWith('LC_')) {
			delete process.env[l];
		}
	}

	const packageFile = resolve(packagePath, 'package.json');

	if (!(await exists(packageFile))) {
		throw new Error('No package.json found');
	}
	const packageJson = require(packageFile);
	log('package.name = %s', packageJson.name);

	if (packageJson.private) {
		log('Private package detected, deny run.');
		printResult(argv.includes('--json'), []);
		return 0;
	}

	const distTag = getArg('--dist-tag', 'latest');
	const registry = await detectRegistry(getArg('--registry', 'detect'));

	const result = await getVersionCached(packageJson.name, distTag, registry);
	log('npm remote version = %s', result.version);
	log('package.json local version = %s', packageJson.version);

	if (!result.version || packageJson.version !== result.version) {
		errorLog('local (%s) already !== remote (%s), no more change needed.', packageJson.version, result.version);
		printResult(argv.includes('--json'), ['package.json'], false);
		return 0;
	}

	const workingRoot = resolve(tmpdir(), 'poor-man-s-package-change/working');
	const tempFolder = await prepareWorkingFolder(workingRoot, packageJson.name, packageJson.version);
	const tempFile = tempFolder + `${basename(packageJson.name)}.${packageJson.version}.tgz`;

	await downloadIfNot(result.tarball, tempFile);
	await decompressTargz(tempFile, tempFolder);
	await gitInit(tempFolder);

	const pack = await packCurrentVersion(packagePath);
	log('\n--> ', pack);

	await decompressTargz(pack, tempFolder);
	const changedFiles = await gitChange(tempFolder);

	if (autoInc) {
		if (changedFiles.length) {
			log('auto version increment...');
			await increaseVersion(packageFile);
		} else {
			log('nothing changed');
		}
	} else {
		printResult(argv.includes('--json'), changedFiles);
	}
	return 0;
}

function printResult(forceJson: boolean, changedFiles: string[], changed?: boolean) {
	if (process.stdout.isTTY && !forceJson) {
		if (changedFiles.length === 0) {
			console.log('changed: no.');
		} else {
			log('%s files has change:', changedFiles.length);
			for (const f of changedFiles) {
				log('  %s', f);
			}
			console.log('changed: yes.');
		}
	} else {
		if (changed === undefined) {
			changed = changedFiles.length > 0;
		}
		console.log(JSON.stringify({ changedFiles, changed }));
	}
}
