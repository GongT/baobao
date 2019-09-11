import { getAllPathUpToRoot, PlatformPathArray } from '@idlebox/platform';
import { dirname } from 'path';
import callGulpScript from './api/callGulpScript';
import { PROJECT_ROOT } from './global';

export default async function () {
	require('source-map-support/register');

	const path = new PlatformPathArray('path');
	path.append(...getAllPathUpToRoot(dirname(__dirname), 'node_modules/.bin'));

	try {
		require('gulp');
	} catch {
		throw new Error('No gulp installed');
	}
	const gulp = require('gulp');

	const argv = process.argv.slice(2);
	const command = argv.find(item => !item.startsWith('-'));

	if (!command) {
		throw new Error('Must set an action to run');
	}
	console.log('running command `%s` in "%s"', command, PROJECT_ROOT);

	await callGulpScript(gulp, PROJECT_ROOT, command);
}
