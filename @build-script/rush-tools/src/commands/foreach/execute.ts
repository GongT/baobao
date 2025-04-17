import { RushProject } from '../../api/rushProject.js';
import type { ArgOf } from '../../common/args.js';
import { runCustomCommand } from '../../common/foreachAction.js';

export async function runForeach(options: ArgOf<typeof import('./arguments')>) {
	const rush = new RushProject();
	for (const project of rush.projects) {
		await runCustomCommand(rush, project, options);
	}
}
