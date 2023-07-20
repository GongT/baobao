import { execa, Options } from 'execa';
import { log } from '../inc/log';

const spawnOpts: Options = {
	encoding: 'utf8',
	reject: true,
	stdio: ['ignore', 'pipe', 'pipe'],
	stripFinalNewline: true,
	env: { LANG: 'C.UTF-8' },
	extendEnv: true,
	all: true,
};

let yarnExists = false;

export async function getYarnCache(packageName: string): Promise<string[]> {
	if (!yarnExists) {
		return [];
	}

	let data: any;
	try {
		const ret = await execa('yarn', ['cache', 'list', '--pattern', packageName, '--json'], spawnOpts);
		data = JSON.parse(ret.all!).data;
	} catch {
		yarnExists = false;
		return [];
	}

	const { head, body } = data;
	const iname = head.indexOf('Name');
	const iversion = head.indexOf('Version');

	const ret: string[] = [];
	for (const item of body) {
		if (item[iname] !== packageName) {
			continue;
		}
		ret.push(item[iversion]);
	}

	if (ret.length) {
		log('[cache]     YARN: %s', ret.join(', '));
		return ret;
	} else {
		return [];
	}
}
