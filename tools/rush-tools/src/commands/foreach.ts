import * as execa from 'execa';
import { eachProject } from '../api/each';
import { getCurrentRushRootPath, toProjectPathAbsolute } from '../api/load';

export async function runForEach() {
	const args = process.argv.slice(2);
	if (args.length === 0) {
		throw new Error('Must specific some command or js file to run');
	}

	if (args[0].endsWith('.js') || args[0].endsWith('.mjs')) {
		args.unshift('node');
	} else if (args[0].endsWith('.ts')) {
		args.unshift('ts-node');
	}

	for (const { projectFolder, packageName } of eachProject()) {
		const absPath = toProjectPathAbsolute(projectFolder);
		process.env.PROJECT_PATH = absPath;
		process.env.PROJECT_NAME = packageName;
		process.env.RUSH_ROOT = getCurrentRushRootPath();
		await execa(args[0], args.slice(1), {
			cwd: absPath,
			// env.path
			stdio: 'inherit',
		});
	}
}
