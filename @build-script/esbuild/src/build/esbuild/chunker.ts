import { resolve } from 'node:path';
import { entrySourceRoot } from '../library/constants.js';
import { rush } from '../library/rush.js';
import { normalizePackageName } from './library.js';

export function createEntrypoints() {
	const entries: Record<string, string> = {
		main: resolve(entrySourceRoot, 'app-main-entry-point.ts'),
		// bootstrap: resolve(entrySourceRoot, 'bootstrap.ts'),
	};

	for (const project of rush.projects) {
		if (project.packageName === '@moffett/entry' || project.packageName === '@moffett/build-rig') continue;
		const { main, module } = rush.packageJsonContent(project);
		const mainEntry = module || main;
		if (!mainEntry) {
			console.error('\x1B[38;5;11mWarn: missing entry of package %s\x1B[0m', project.packageName);
			continue;
		}

		const entryName = normalizePackageName(project.packageName);
		entries[entryName] = rush.absolute(project, mainEntry);
	}
	return entries;
}
