import { basename, resolve } from 'path';
import { exists, PathEnvironment, printLine } from '@idlebox/node';
import { gt } from 'semver';
import { getTarballCached, getVersionCached } from './cache/tarball';
import { getArg } from './inc/getArg';
import { gitChange, gitInit } from './inc/git';
import { errorLog, log, logEnable } from './inc/log';
import { prepareWorkingFolder } from './inc/prepareWorkingFolder';
import { getTempFolder } from './inc/rush';
import { decompressTargz } from './packageManage/decompress';
import { detectRegistry } from './packageManage/detectRegistry';
import { downloadIfNot } from './packageManage/downloadIfNot';
import { increaseVersion } from './packageManage/increaseVersion';
import { packCurrentVersion } from './packageManage/package';
import { rewritePackage } from './packageManage/rewritePackage';

function help() {
	console.error(`Usage: detect-package-change --registry ??? --dist-tag ??? --package ??? --bump --quiet
	registry: default to use system .npmrc (https:// should include)
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
	log('Working at %s', packagePath);

	const p = new PathEnvironment();
	p.add(resolve(packagePath, 'node_modules/.bin'));
	p.add(resolve(process.argv0, '..'));
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
	log('====');

	if (packageJson.private) {
		log('Private package detected, deny run.');
		printResult(argv.includes('--json'), []);
		return 0;
	}

	const distTag = getArg('--dist-tag', 'latest');
	const registry = await detectRegistry(getArg('--registry', 'detect'), packagePath);

	const remoteVersion = await getVersionCached(packageJson.name, distTag, registry);
	log(' -> npm remote version = %s', remoteVersion);
	log(' -> package.json local version = %s', packageJson.version);

	if (!remoteVersion || gt(packageJson.version, remoteVersion)) {
		errorLog('local (%s) already > remote (%s), no more change needed.', packageJson.version, remoteVersion);
		printResult(argv.includes('--json'), ['package.json'], false);
		return 0;
	} else {
		log('local (%s) <= remote (%s), try detect change...', packageJson.version, remoteVersion);
	}

	const workingRoot = resolve(getTempFolder(packagePath), 'package-change/working');
	const tempFolder = await prepareWorkingFolder(workingRoot, packageJson.name, packageJson.version);
	const tempFile = tempFolder + `${basename(packageJson.name)}.${packageJson.version}.tgz`;

	const tarball = await getTarballCached(packageJson.name, distTag, registry);
	if (!tarball) {
		throw new Error(`can not get tarball url: "${packageJson.name}@${distTag}" from "${registry}"`);
	}
	await downloadIfNot(tarball!, tempFile);
	await decompressTargz(tempFile, tempFolder);
	await rewritePackage(tempFolder);
	await gitInit(tempFolder);

	const pack = await packCurrentVersion(packagePath);
	log('  --> ', pack);

	await decompressTargz(pack, tempFolder);
	await rewritePackage(tempFolder);
	const changedFiles = await gitChange(tempFolder);

	if (autoInc) {
		if (changedFiles.length) {
			log('auto version increment...');
			await increaseVersion(packageFile, remoteVersion);
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
			if (logEnable) printLine();
			log('%s', changedFiles.join('\n'));
			log('%s lines of change', changedFiles.length);
			if (logEnable) printLine();
			console.log('changed: yes.');
		}
	} else {
		if (changed === undefined) {
			changed = changedFiles.length > 0;
		}
		console.log(JSON.stringify({ changedFiles, changed }));
	}
}
