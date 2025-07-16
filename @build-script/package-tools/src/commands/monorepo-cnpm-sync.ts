import { createWorkspace } from '@build-script/monorepo-lib';
import { argv } from '@idlebox/args/default';
import { CommandDefine, isQuiet, pDesc } from '../common/functions/cli.js';
import { cnpmSync } from '../common/shared-jobs/cnpm-sync.js';

export class Command extends CommandDefine {
	protected override _usage = '';
	protected override _description = '调用cnpm sync命令';
	protected override _help = pDesc('需要在PATH中存在cnpm命令');
}

export async function main() {
	const workspace = await createWorkspace();
	const list = await workspace.listPackages();

	const dry = argv.flag('--dry') > 0;

	await cnpmSync(list, isQuiet, dry);
}
