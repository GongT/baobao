import { RushProject } from '../../api/rushProject';
import { description } from '../../common/description';
import { spawnRushPassthrough } from '../../common/spawnRush';

/** @internal */
export default async function runUpdate(argv: string[]) {
	const rush = new RushProject();

	const env = { npm_config_prefer_frozen_lockfile: 'false', npm_config_prefer_offline: 'false' };

	await spawnRushPassthrough('update', argv, env);

	for (const item of rush.autoinstallers) {
		await spawnRushPassthrough('update-autoinstaller', ['--name', item.packageName], env);
	}
}

description(runUpdate, 'Run `rush update` plus rush `update-autoinstaller`.');
