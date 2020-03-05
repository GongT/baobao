import * as gulp from 'gulp';
import { resolve } from 'path';
import { loadToGulp } from '../api/context';
import { fancyLog } from '../common/fancyLog';

export default async function runBuildScript() {
	const command = process.argv[2]!;

	require(resolve(__dirname, '../../api.js')); // init singleton

	loadToGulp(gulp, process.cwd());
	try {
		let p2: Promise<void>;
		const task = gulp.task(command);

		if (!task) {
			fancyLog.error('Command "%s" not found', command);
			process.exit(66);
		}

		const p1 = new Promise((resolve, reject) => {
			p2 = task((error?: Error) => {
				if (error) {
					reject(error);
				} else {
					fancyLog('Gulp Done.');
					resolve();
				}
			});
		});
		await Promise.all([p1, p2!]);
	} catch (e) {
		// fancyLog.error('Failed to run command %s', command);
		throw e;
	}
}