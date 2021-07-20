import 'source-map-support/register';
import { dirname } from 'path';
import { buildProjects, RushProject } from '@build-script/rush-tools';
import { commandInPath, writeFileIfChange } from '@idlebox/node';
import { mkdirp, pathExistsSync, readFile } from 'fs-extra';
import { execPromise } from '../include/execPromise';

async function main() {
	const rushProject = new RushProject();

	const checkBin = rushProject.absolute('@build-script/poormans-package-change', 'bin/load.js');
	const yarnBin = await commandInPath('yarn');
	if (!yarnBin) {
		throw new Error(`Failed to find yarn in PATH.`);
	}
	const count = rushProject.projects.length;
	let current = 0;
	buildProjects({ rushProject, concurrent: 1 }, async (item) => {
		current++;
		console.error('📦 \x1B[38;5;14mPublishing package (%s of %s):\x1B[0m %s ...', current, count, item.packageName);

		let pkgJson: any;
		try {
			pkgJson = require(rushProject.absolute(item, 'package.json'));
		} catch (e) {
			throw new Error('package.json is invalid');
		}

		if (pkgJson.private) {
			console.error('    🛑 private package, skip!');
			return;
		}

		const stateFile = rushProject.tempFile(
			'proj_status/last-publish.' + item.packageName.replace('/', '__') + '.version.txt'
		);

		const lastPubVersion = pathExistsSync(stateFile) ? await readFile(stateFile, 'utf-8') : '-';
		if (lastPubVersion === pkgJson.version) {
			console.error('    🤔 no change.');
			return;
		}
		// console.error('    check...');

		const logFile = rushProject.tempFile('logs/yarn-publish/' + item.packageName.replace('/', '__') + '.log');
		// console.error('          log -> %s', logFile);
		await execPromise({
			cwd: rushProject.absolute(item),
			argv: [
				checkBin,
				'run-if-version-mismatch',
				'--',
				'yarn',
				'publish',
				'--registry',
				'https://registry.npmjs.org',
				'--access=public',
			],
			logFile,
		});
		// console.error('          complete.');
		const log = await readFile(logFile, '');
		if (/^success Published\.$/m.test(log)) {
			console.error('    👍 success.');
		} else {
			console.error('    🤔 no update.', lastPubVersion, pkgJson.version);
		}

		await mkdirp(dirname(stateFile));
		await writeFileIfChange(stateFile, pkgJson.version);
	});
}

main().then(
	() => {
		console.log(`\x1B[38;5;10mComplete.\x1B[0m `);
	},
	(e) => {
		console.error(e.stack);
		process.exit(1);
	}
);
