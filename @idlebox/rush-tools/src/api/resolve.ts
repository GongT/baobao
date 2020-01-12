import { RushConfiguration } from '@microsoft/rush-lib';
import { existsSync } from 'fs-extra';
import { eachProject, IProjectConfig } from './each';

export function resolveRushProjectBuildOrder(path: string = process.cwd()) {
	const config = RushConfiguration.loadFromDefaultLocation({ startingFolder: path });
	if (!existsSync(config.rushLinkJsonFilename)) {
		throw new Error('Project temp folder not exists, rush update is required.');
	}

	const projectMap = new Map<string, IProjectConfig>();
	const depsMap = new Map<string, string[]>();
	const levelTrack = new Map<string, number>();
	const { localLinks } = require(config.rushLinkJsonFilename);
	for (const item of eachProject()) {
		let deps: string[] = localLinks[item.packageName] || [];

		if (item.cyclicDependencyProjects) {
			deps = deps.filter((dep) => {
				return !item.cyclicDependencyProjects?.includes(dep);
			});
		}

		projectMap.set(item.packageName, item);
		if (deps.length) {
			depsMap.set(item.packageName, deps);
		}
	}

	let maxLevel = 0;
	projectMap.forEach((proj) => {
		if (!levelTrack.has(proj.packageName)) {
			const newLevel = trackDepLevel(proj);
			maxLevel = Math.max(maxLevel, newLevel);
		}
	});

	const ret: IProjectConfig[][] = [];
	for (let i = 0; i <= maxLevel; i++) {
		ret[i] = [];
	}
	projectMap.forEach((proj) => {
		const level = levelTrack.get(proj.packageName)!;
		ret[level].push(proj);
	});

	return ret;

	function trackDepLevel(proj: IProjectConfig) {
		if (!depsMap.has(proj.packageName)) {
			levelTrack.set(proj.packageName, 0);
			return 0;
		}

		for (const dep of depsMap.get(proj.packageName)!) {
			if (!projectMap.has(dep)) {
				throw new Error('Unexpect dependency ' + dep + ' of project ' + proj.packageName);
			}
			const depProj = projectMap.get(dep)!;

			if (levelTrack.has(depProj.packageName)) {
				const old = levelTrack.get(proj.packageName) || 0;
				const newV = levelTrack.get(depProj.packageName)! + 1;
				levelTrack.set(proj.packageName, Math.max(old, newV));
			} else {
				trackDepLevel(depProj);
			}
		}

		return levelTrack.get(proj.packageName)!;
	}
}
