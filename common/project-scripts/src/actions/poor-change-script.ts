import { overallOrder, RushProject } from '@build-script/rush-tools';
import { execPromise } from '../include/execPromise';
import { increaseVersion } from '../include/increaseVersion';

async function main() {
	const rushProject = new RushProject();
	const projects = overallOrder(rushProject).reverse();

	const checkBin = rushProject.absolute('@build-script/poormans-package-change', 'bin/load.js');
	const syncBin = rushProject.absolute('@build-script/rush-tools', 'bin.cjs');

	for (const item of projects) {
		console.log('check package: %s', item.packageName);
		const logFile = rushProject.absolute(item.projectFolder, 'update-version.log');
		const { full, result } = await execPromise({
			argv: [
				'-r',
				'source-map-support/register',
				checkBin,
				'detect-package-change',
				'--registry',
				'https://registry.npmjs.org/',
				'--package',
				rushProject.absolute(item.projectFolder),
				'--json',
			],
			logFile,
		});
		let changed: boolean;
		try {
			changed = JSON.parse(result).changed;
			if (typeof changed !== 'boolean') throw new Error('boolean value expected.');
		} catch (e) {
			console.error(full);
			console.error('===============================');
			console.error(e.message);
			process.exit(1);
		}

		console.log('    changed: %s', changed);
		if (changed) {
			increaseVersion(rushProject.absolute(item.projectFolder, 'package.json'));
			console.log('    ! autofix');
			const logFile = rushProject.absolute('common/temp/autofix.log');
			await execPromise({
				argv: ['-r', 'source-map-support/register', syncBin, 'autofix'],
				logFile,
			});
		}
	}
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
