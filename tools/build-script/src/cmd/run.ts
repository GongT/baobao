import * as gulp from 'gulp';
import { resolve } from 'path';
import { loadToGulp } from '../api/context';
import { fancyLog } from '../common/fancyLog';

export default async function runBuildScript() {
	const command = process.argv[2]!;

	require(resolve(__dirname, '../../api.js')); // init singleton

	loadToGulp(gulp, process.cwd());
	try {
		await gulp.task(command)(() => {
			fancyLog('Gulp Done.');
		});
	} catch (e) {
		fancyLog.error('Failed to run command %s', command);
		throw e;
	}
}
