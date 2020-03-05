import { loadConfigSync } from './load';
import { IProjectConfig } from './limitedJson';

export function eachProject(fromPath = process.cwd()): IProjectConfig[] {
	const cfg = loadConfigSync(fromPath);
	if (!cfg) throw new Error('Can not find config rush.json.');
	return cfg.projects;
}
