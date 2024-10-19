import { RushProject } from '../../api/rushProject';
import type { ArgOf } from '../../common/args.js';
import { spawnRushPassthrough } from '../../common/spawnRush';

export async function runUpdate({ extra }: ArgOf<typeof import('./arguments')>) {
	const rush = new RushProject();

	const env = { npm_config_prefer_frozen_lockfile: 'false', npm_config_prefer_offline: 'false' };

	await spawnRushPassthrough('update', extra, env);

	for (const item of rush.autoinstallers) {
		await spawnRushPassthrough('update-autoinstaller', ['--name', item.packageName], env);
	}
}
