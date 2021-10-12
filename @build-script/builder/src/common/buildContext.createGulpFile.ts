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

	let Gulpfile: string;
	const packageJson: any = loadJsonFileSync(resolve(ctx.projectRoot, 'package.json'));
	if (packageJson.type === 'module') {
		Gulpfile = resolve(ctx.projectRoot, 'Gulpfile.ts');
		writeFileSync(
			Gulpfile,
			`import gulp from 'gulp';
import { loadToGulp } from '@build-script/builder';
import { dirname } from 'path';
loadToGulp(gulp, dirname(import.meta.url));
`
		);

		if (!packageJson.dependencies?.['ts-node'] && !packageJson.devDependencies?.['ts-node']) {
			if (!packageJson.devDependencies) packageJson.devDependencies = {};
			packageJson.devDependencies['ts-node'] = 'latest';
			writeJsonFileBackSync(packageJson);
		}
	} else {
		Gulpfile = resolve(ctx.projectRoot, 'Gulpfile.js');
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
