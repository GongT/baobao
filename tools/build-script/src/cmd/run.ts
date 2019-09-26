import * as gulp from 'gulp';
import { resolve } from 'path';
import { loadToGulp } from '../api/context';
import { fancyLog } from '../common/fancyLog';

export default async function runBuildScript() {
	const command = process.argv[2]!;

	require(resolve(__dirname, '../../api.js')); // init singleton

	loadToGulp(gulp, process.cwd());
	await gulp.task(command)(() => {
		fancyLog('Gulp Done.');
	});
}
