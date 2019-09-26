import * as gulp from 'gulp';
import { fancyLog } from '../common/fancyLog';

const { loadToGulp } = require('@idlebox/build-script');

export default async function runBuildScript() {
	const command = process.argv[2]!;

	loadToGulp(gulp, process.cwd());
	await gulp.task(command)(() => {
		fancyLog('Gulp Done.');
	});
}
