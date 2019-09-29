import * as execa from 'execa';
import { eachProject } from '../api/each';
import { getCurrentRushRootPath, toProjectPathAbsolute } from '../api/load';
import { description } from '../common/description';

export default async function runForEach(argv: string[]) {
	if (argv.length === 0) {
		throw new Error('Must specific some command or js file to run');
	}

	if (argv[0].endsWith('.js') || argv[0].endsWith('.mjs')) {
		argv.unshift('node');
	} else if (argv[0].endsWith('.ts')) {
		argv.unshift('ts-node');
	}

	process.env.RUSH_ROOT = getCurrentRushRootPath();
	for (const { projectFolder, packageName } of eachProject()) {
		const absPath = toProjectPathAbsolute(projectFolder);
		process.env.PROJECT_PATH = absPath;
		process.env.PROJECT_NAME = packageName;
		await execa(argv[0], argv.slice(1), {
			cwd: absPath,
			// env.path
			stdio: 'inherit',
		});
	}
}

description(runForEach, 'Run a same command in every project directory.');
