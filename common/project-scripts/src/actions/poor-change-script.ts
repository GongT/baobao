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
		const { out, err } = await execPromise(process.argv0, [
			'-r',
			'source-map-support/register',
			checkBin,
			'detect-package-change',
			'--registry',
			'https://registry.npmjs.org/',
			'--package',
			rushProject.absolute(item.projectFolder),
			'--json',
		]);
		let changed: boolean;
		try {
			changed = JSON.parse(out).changed;
			if (typeof changed !== 'boolean') throw new Error('boolean value expected.');
		} catch (e) {
			console.error(err);
			console.error('===============================');
			console.error(e.message);
			process.exit(1);
		}

		console.log('    changed: %s', changed);
		if (changed) {
			increaseVersion(rushProject.absolute(item.projectFolder, 'package.json'));
			console.log('    ! autofix');
			await execPromise(process.argv0, ['-r', 'source-map-support/register', syncBin, 'autofix']);
		}
	}
}

main().then(
	() => {
		console.log(`\x1B[38;5;10mComplete.\x1B[0m `);
	},
	(e) => {
		setImmediate(() => {
			throw e;
		});
	}
);
