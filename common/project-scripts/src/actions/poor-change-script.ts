import { overallOrder, RushProject } from '@build-script/rush-tools';
import { execPromise } from '../include/execPromise';
import { increaseVersion } from '../include/increaseVersion';

async function main() {
	const rushProject = new RushProject();

	console.log('✍️ \x1B[38;5;14mRunning "rush pretty"\x1B[0m');
	await execPromise({
		cmd: 'rush',
		argv: ['pretty'],
		cwd: rushProject.projectRoot,
	});

	const projects = overallOrder(rushProject); //.reverse();

	const checkBin = rushProject.absolute('@build-script/poormans-package-change', 'bin/load.js');
	const syncBin = rushProject.absolute('@build-script/rush-tools', 'bin.cjs');

	for (const item of projects) {
		console.log('🔍 \x1B[38;5;14mCheck package\x1B[0m - %s', item.packageName);
		const logFile = rushProject.absolute(item.projectFolder, 'update-version.log');
		const { full, result } = await execPromise({
			argv: [
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
			console.error('=============================================');
			console.error('\x1B[38;5;9m[     detect-package-change has failed.     ]\x1B[0m');
			console.error('\x1B[2m%s\x1B[0m', full);
			console.error('=============================================');
			console.error('failed parse json [ %s ]: %s', result, e.message);
			process.exit(1);
		}

		if (changed) {
			console.log('🎯     Change detected');
			console.log('         * %s', JSON.parse(result).changedFiles.join(', '));

			console.log('✍️     Updating version...');
			await increaseVersion(rushProject.absolute(item.projectFolder, 'package.json'));
			console.log('       Autofix...');
			const logFile = rushProject.absolute('common/temp/autofix.log');
			await execPromise({
				argv: [syncBin, 'autofix', '--skip-cyclic'],
				logFile,
			});
			console.log('✨ \x1B[38;5;10m  Updated\x1B[0m');
		} else {
			console.log('✨ \x1B[38;5;10m  No change detected\x1B[0m');
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
