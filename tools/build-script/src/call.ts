import { loadToGulp } from './api';

export default async function callScript() {
	const gulp = require('gulp');
	Object.defineProperty(global, 'gulp', {
		value: gulp,
		configurable: false,
		enumerable: true,
		writable: false,
	});
	const tasks = await loadToGulp(gulp);

	const argv = process.argv.slice(2);
	const command = argv.find(item => !item.startsWith('-'));

	if (!command) {
		throw new Error('Must set an action to run');
	}

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
