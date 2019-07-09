import loadToGulp from './loadToGulp';
import { Gulp } from 'gulp';

export default async function (gulp: Gulp, path: string, command: string) {
	const tasks = await loadToGulp(path, gulp);

	if (!tasks[command]) {
		throw new Error('No such action: ' + command);
	}

	return new Promise((resolve, reject) => {
		try {
			const p = Promise.resolve(tasks[command]((e) => {
				if (e) {
					reject(e);
				} else {
					resolve();
				}
			}));

			if (p && p.then) {
				p.then(resolve, reject);
			}
		} catch (e) {
			reject(e);
		}
	});
}
