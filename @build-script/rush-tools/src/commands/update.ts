import { RushProject } from '../api/rushProject';
import { description } from '../common/description';
import { spawnRushPassthrough } from '../common/spawnRush';

/** @internal */
export default async function runUpdate(argv: string[]) {
	const rush = new RushProject();

	await spawnRushPassthrough('update', argv);

	for (const item of rush.autoinstallers) {
		await spawnRushPassthrough('update-autoinstaller', ['--name', item.packageName]);
	}
}

description(runUpdate, 'Run `rush update` plus rush `update-autoinstaller`.');
