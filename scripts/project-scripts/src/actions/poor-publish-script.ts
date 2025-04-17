import { buildProjects, RushProject } from '@build-script/rush-tools';
import { humanDate } from '@idlebox/common';
import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { emptyDir } from '@idlebox/node';
import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { execPromise } from '../include/execPromise.js';
import { normalizePackageName } from '../include/paths.js';
import '../include/prefix';
import { ProjectStateCache } from '../include/projectState.js';

const yarnSuccessLine = /^success Published\.$/m;

function checkPnpmUploadLog(name: string, version: string, log: string) {
	// console.error('------------------------------------------------------');
	// console.error(log);
	// console.error('------------------------------------------------------');
	// console.error(`+ ${name}@${version}`);
	// console.error('------------------------------------------------------');
	return log.includes(`+ ${name}@${version}`);
}

async function main(argv: string[]) {
	const rushProject = new RushProject();

	let skip = 0;
	{
		const index = argv.indexOf('--skip');
		if (index !== -1) {
			const skipArg = argv.splice(index, 2);
			skip = parseInt(skipArg.pop());
			if (isNaN(skip)) {
				throw new Error('--skip must with number (got ' + argv.join(' ') + ')');
			}
		}
	}

	const checkBin = rushProject.absolute('@build-script/node-package-tools', 'load.mjs');
	const pnpmBin = rushProject.getPackageManager().binAbsolute;
	await emptyDir(rushProject.tempFile('logs/do-publish/'));

	const stateManager = new ProjectStateCache(rushProject);

	const count = rushProject.projects.length;
	let current = 0;
	return buildProjects({ rushProject, concurrent: 1 }, async (item) => {
		current++;
		console.error('📦 \x1B[38;5;14mPublishing package (%s of %s):\x1B[0m %s ...', current, count, item.packageName);

		if (--skip > 0) {
			console.error('    🛑 user request skip...');
			return;
		}

		if (!item.shouldPublish) {
			console.error('    🛑 should not publish, skip!');
			return;
		}

		let pkgJson: any;
		try {
			pkgJson = JSON.parse(readFileSync(rushProject.absolute(item, 'package.json'), 'utf-8'));
		} catch (e) {
			throw new Error('package.json is invalid');
		}

		if (pkgJson.private) {
			console.error('    🛑 private package, skip!');
			return;
		}

		const state = await stateManager.project(item.packageName);
		if (state.lastPublishVersion === pkgJson.version) {
			console.error(
				'    🤔 already published: %s at %s',
				state.lastPublishVersion,
				humanDate.datetime(state.lastPublishTime),
			);
			return;
		}
		// console.error('    check...');

		const logFile = rushProject.tempFile('logs/do-publish/' + normalizePackageName(item.packageName) + '.log');
		const pkgPath = rushProject.absolute(item);

		const localNpmrc = resolve(pkgPath, '.npmrc');
		const configNpmrc = resolve(rushProject.configRoot, '.npmrc-publish');
		await ensureLinkTarget(configNpmrc, localNpmrc);

		// console.error('          log -> %s', logFile);
		await execPromise({
			cwd: pkgPath,
			argv: [checkBin, 'run-if-version-mismatch', '--', pnpmBin, 'publish', '--no-git-checks'],
			logFile,
		});
		// console.error('          complete.');
		const log = await readFile(logFile, 'utf-8');
		if (yarnSuccessLine.test(log) || checkPnpmUploadLog(pkgJson.name, pkgJson.version, log)) {
			console.error('    👍 success.');
			state.lastPublishVersion = pkgJson.version;
			state.lastPublishTime = new Date();
		} else {
			console.error('    🤔 no update. (local: %s, remote: %s)', state.lastPublishVersion, pkgJson.version);
			if (!state.lastPublishVersion) {
				state.lastPublishVersion = pkgJson.version;
				state.lastPublishTime = new Date();
			}
		}

		await state.save();
	});
}

main(process.argv.slice(2)).then(
	() => {
		console.log(`\x1B[38;5;10mComplete.\x1B[0m `);
	},
	(e) => {
		console.error(e.stack);
		process.exit(1);
	},
);
