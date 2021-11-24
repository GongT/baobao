import { resolve } from 'path';
import { loadJsonFileSync, writeJsonFileBackSync } from '@idlebox/node-json-edit';
import { warn } from 'fancy-log';
import { writeFileSync } from 'fs-extra';
import { BuildContext } from '../common/buildContext';
import { findGulpfile } from '../common/gulp';

export function createGulpFile(ctx: BuildContext) {
	const found = findGulpfile(ctx.projectRoot);
	if (found) {
		return;
	}

	const Gulpfile: string = resolve(ctx.projectRoot, 'Gulpfile.js');
	const packageJson: any = loadJsonFileSync(resolve(ctx.projectRoot, 'package.json'));
	if (packageJson.type === 'module') {
		writeFileSync(
			Gulpfile,
			`import gulp from 'gulp';
import api from '@build-script/builder';
import { dirname } from 'path';
api.loadToGulp(gulp, dirname(import.meta.url));
`
		);

		if (!packageJson.dependencies?.['esm'] && !packageJson.devDependencies?.['esm']) {
			if (!packageJson.devDependencies) packageJson.devDependencies = {};
			packageJson.devDependencies['esm'] = 'latest';
			writeJsonFileBackSync(packageJson);
		}
	} else {
		writeFileSync(
			Gulpfile,
			`const gulp = require('gulp');
const { loadToGulp } = require('@build-script/builder');
loadToGulp(gulp, __dirname);
`
		);
	}

	warn('Created new gulpfile: %s', Gulpfile);
}
