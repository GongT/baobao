import callGulpScript from './api/callGulpScript';
import { PROJECT_ROOT } from './global';

export default function () {
	const gulp = require('gulp');

	const argv = process.argv.slice(2);
	const command = argv.find(item => !item.startsWith('-'));

	if (!command) {
		throw new Error('Must set an action to run');
	}

	return callGulpScript(gulp, PROJECT_ROOT, command);
}
