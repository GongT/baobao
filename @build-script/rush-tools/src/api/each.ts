import { loadConfig } from './load.js';

export async function eachProject(fromPath = process.cwd()) {
	const cfg = await loadConfig(fromPath);
	if (!cfg) throw new Error('Can not find config rush.json.');
	return cfg.projects;
}
