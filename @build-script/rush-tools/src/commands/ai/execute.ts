import { exists } from '@idlebox/node';
import { execa } from 'execa';
import { readdir } from 'fs/promises';
import { basename, extname, resolve } from 'path';
import { RushProject } from '../../api/rushProject';
import type { ArgOf } from '../../common/args.js';
import { createLinkIfNot } from '../../common/link';

/** @internal */
export function runAi({ action, extra }: ArgOf<typeof import('./arguments')>) {
	const rush = new RushProject();
	switch (action) {
		case 'update':
			return update(rush, extra);
		case 'upgrade':
			return upgrade(rush, extra);
		case 'link-local':
			return linkLocal(rush);
	}
}

async function update(rush: RushProject, argv: string[]) {
	const pm = rush.getPackageManager();
	for (const project of rush.autoinstallers) {
		console.log('[rush-tools] \x1B[38;5;10mrun %s:install in %s\x1B[0m', pm.type, project.packageName);
		await execa(pm.binAbsolute, ['install', ...argv], { stdio: 'inherit', cwd: rush.absolute(project) });
	}
}

export const updateAllInstallers = update;

async function upgrade(rush: RushProject, argv: string[]) {
	const pm = rush.getPackageManager();
	for (const project of rush.autoinstallers) {
		console.log('[rush-tools] \x1B[38;5;10mrun %s:update in %s\x1B[0m', pm.type, project.packageName);
		await execa(pm.binAbsolute, ['update', '--latest', ...argv], {
			stdio: 'inherit',
			cwd: rush.absolute(project),
			env: {
				npm_config_perfer_offline: 'false',
				npm_config_perfer_online: 'true',
			},
		});
	}
}

async function linkLocal(rush: RushProject) {
	for (const project of rush.autoinstallers) {
		const path = rush.absolute(project);
		const nm = resolve(path, 'node_modules/.bin');
		if (await exists(nm)) {
			console.log('[rush-tools] \x1B[38;5;10mcreating symlink to %s/node_modules\x1B[0m', project.packageName);
			for (const item of await readdir(nm)) {
				const name = basename(item, extname(item));
				await createLinkIfNot(rush, name, resolve(nm, item));
			}
		}

		const pjson = rush.packageJsonContent(project);
		if (typeof pjson.bin === 'string') {
			console.log('[rush-tools] \x1B[38;5;10mcreating symlink to %s::bin\x1B[0m', project.packageName);
			await createLinkIfNot(rush, basename(pjson.name), resolve(path, pjson.bin));
		} else if (typeof pjson.bin === 'object') {
			console.log('[rush-tools] \x1B[38;5;10mcreating symlink to %s::bins\x1B[0m', project.packageName);
			for (const [name, rpath] of Object.entries<string>(pjson.bin)) {
				await createLinkIfNot(rush, name, resolve(path, rpath));
			}
		}
	}
}
