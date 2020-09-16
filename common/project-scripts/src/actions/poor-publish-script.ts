import { buildProjects, RushProject } from '@build-script/rush-tools';
import { commandInPath } from '@idlebox/node';
import { readFile } from 'fs-extra';
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

		try {
			if (require(rushProject.absolute(item, 'package.json')).private) {
				console.error('    🛑 private package, skip!');
				return;
			}
		} catch (e) {
			throw new Error('package.json is invalid');
		}
		// console.error('    check...');

		const logFile = rushProject.absolute(item, 'yarn-publish.log');
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
			console.error('    🤔 no change.');
		}
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
