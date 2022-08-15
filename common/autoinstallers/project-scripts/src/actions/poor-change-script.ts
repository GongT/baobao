import '../include/prefix';
import { resolve } from 'path';
import { overallOrder, RushProject } from '@build-script/rush-tools';
import { humanDate } from '@idlebox/common';
import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { pathExists, readFileSync } from 'fs-extra';
import { execPromise } from '../include/execPromise';
import { increaseVersion } from '../include/increaseVersion';

async function getNpmRc(rushProject: RushProject) {
	let npmrc = resolve(rushProject.configRoot, '.npmrc-publish');
	if (await pathExists(npmrc)) {
		return npmrc;
	}
	npmrc = resolve(rushProject.configRoot, '.npmrc');
	if (await pathExists(npmrc)) {
		return npmrc;
	}
	return undefined;
}

interface ICheckResult {
	changed: boolean;
	changedFiles: string[];
}

async function main() {
	const rushProject = new RushProject();
	const verbose = process.argv.includes('--verbose');

	const npmrc = await getNpmRc(rushProject);
	if (verbose) {
		console.error('\x1B[2m - using npmrc file: %s\x1B[0m', npmrc || '*missing');
	}

	console.log('✍️  \x1B[38;5;14mRunning "rush pretty"\x1B[0m');
	await execPromise({
		cmd: 'rush',
		argv: ['pretty'],
		cwd: rushProject.projectRoot,
	});

	const projects = overallOrder(rushProject); //.reverse();

	const checkBin = rushProject.absolute('@build-script/poormans-package-change', 'bin/load.js');
	const syncBin = rushProject.absolute('@build-script/rush-tools', 'bin.cjs');

	for (const [index, item] of projects.entries()) {
		if (item._isAutoInstaller) continue;
		let start: number = Date.now();

		console.log('🔍 \x1B[38;5;14mCheck package\x1B[0m - %s (%s/%s)', item.packageName, index, projects.length);
		const logFile = rushProject.tempFile('logs/update-version/' + item.packageName.replace('/', '__') + '.log');

		const path = rushProject.absolute(item.projectFolder);
		if (npmrc) await ensureLinkTarget(npmrc, resolve(path, '.npmrc'));

		const { full, result } = await execPromise({
			argv: [checkBin, 'detect-package-change', '--json'],
			cwd: path,
			logFile,
		});

		let data: ICheckResult;
		try {
			data = JSON.parse(result);
			if (typeof data.changed !== 'boolean') throw new Error('boolean value expected.');
		} catch (e) {
			console.error('=============================================');
			console.error('\x1B[38;5;9m[     detect-package-change has failed.     ]\x1B[0m');
			console.error('\x1B[2m%s\x1B[0m', full);
			console.error('=============================================');
			console.error('failed parse json [ %s ]: %s', result, e.message);
			process.exit(1);
		}

		if (verbose) {
			console.error(readFileSync(logFile, 'utf8'));
		}

		const { changed, changedFiles } = data;
		if (changed) {
			console.log('🎯     Change detected');
			console.log('         * %s', changedFiles.join(', '));

			console.log('✍️     Updating version...');
			await increaseVersion(rushProject.absolute(item.projectFolder, 'package.json'));
			console.log('       Autofix...');
			const logFile = rushProject.absolute('common/temp/autofix.log');
			await execPromise({
				argv: [syncBin, 'autofix', '--skip-cyclic'],
				logFile,
			});
			console.log('✨ \x1B[38;5;10m  Updated\x1B[0m (in %s)', humanDate.delta(Date.now() - start));
		} else if (changedFiles.length > 0) {
			console.log('✨ \x1B[38;5;10m  Updated (already)\x1B[0m (in %s)', humanDate.delta(Date.now() - start));
		} else {
			console.log('✨ \x1B[38;5;10m  No change detected\x1B[0m (in %s)', humanDate.delta(Date.now() - start));
		}
		console.log('');
	}
}

main().then(
	() => {
		console.log(`\x1B[38;5;10mComplete.\x1B[0m `);
		console.log(`You may need to run "rush update" or "rush ypublish" now`);
	},
	(e) => {
		console.error(e.stack);
		process.exit(1);
	}
);
