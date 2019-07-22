import { Gulp } from 'gulp';
import { fancyLog } from '../inc/fancyLog';
import loadToGulp from './loadToGulp';

export default async function (gulp: Gulp, path: string, command: string) {
	const tasks = loadToGulp(gulp, path);

	if (!tasks[command]) {
		throw new Error('No such action: ' + command);
	}

	await new Promise<void>((resolve, reject) => {
		try {
			fancyLog.debug('executing gulp task: %s', command, tasks[command]);
			tasks[command]((e) => {
				if (e) {
					reject(e);
				} else {
					resolve();
				}
			});
		} catch (e) {
			reject(e);
		}
	});
}
