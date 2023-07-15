import { readdir } from 'fs/promises';
import { basename, extname, resolve } from 'path';
import { exists } from '@idlebox/node';
import { execa } from 'execa';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';
import { createLinkIfNot } from '../common/link';

description(autoInstallers, 'auto installers tool');

/** @internal */
export default function autoInstallers(argv: string[]) {
	const rush = new RushProject();
	switch (argv[0]) {
		case 'update':
			return update(rush, argv.slice(1));
		case 'upgrade':
			return upgrade(rush, argv.slice(1));
		case 'link-local':
			return linkLocal(rush, argv.slice(1));
		default:
			return usage(rush);
	}
}

function usage(rush: RushProject) {
	const pm = rush.getPackageManager().type;
	console.error('rush-tools ai <command> [...args]');
	console.error('\tupdate: run `%s install xxx` in each auto-installer', pm);
	console.error('\tupgrade: run `%s upgrade xxx` in each auto-installer', pm);
	console.error('\tlink-local: create symlink of all auto-installers binary to common/temp/bin', pm);
	process.exit(1);
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
		await execa(pm.binAbsolute, ['update', '--latest', ...argv], { stdio: 'inherit', cwd: rush.absolute(project) });
	}
}

async function linkLocal(rush: RushProject, _argv: string[]) {
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
