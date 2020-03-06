import { buildProjects, RushProject } from '@build-script/rush-tools';
import { commandInPath } from '@idlebox/node';
import { execPromise } from '../include/execPromise';
import { loadEnv } from '../include/envPass';

loadEnv();

async function main() {
	const rushProject = new RushProject();

	const checkBin = rushProject.absolute('@build-script/poormans-package-change', 'bin/load.js');
	const yarnBin = await commandInPath('yarn');
	if (!yarnBin) {
		throw new Error(`Failed to find yarn in PATH.`);
	}
	buildProjects({ rushProject, concurrent: 1 }, async (item) => {
		console.error('Publish package: %s', item.packageName);

		try {
			if (require(rushProject.absolute(item, 'package.json')).private) {
				console.error('    * private package, skip!');
				return;
			}
		} catch (e) {
			throw new Error('package.json is invalid');
		}

		const logFile = rushProject.absolute(item, 'update-version.log');
		await execPromise({
			cwd: rushProject.absolute(item),
			argv: [
				'-r',
				require.resolve('source-map-support/register'),
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
