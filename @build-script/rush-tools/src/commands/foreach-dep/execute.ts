import { createDeps, RushProject } from '../../api.js';
import type { ArgOf } from '../../common/args.js';
import { runCustomCommand } from '../../common/foreachAction.js';

export async function runForeachDep(options: ArgOf<typeof import('./arguments')>) {
	const rush = new RushProject();
	const deps = createDeps(rush);

	let r = deps.overallOrder().map((e) => deps.getNodeData(e));

	if (options.buildOnly) {
		r = r.filter((e) => e.hasBuildScript);
	}
	if (options.publicOnly) {
		r = r.filter((e) => {
			if (!e.project.shouldPublish) return false;
			return !e.packageJson.private;
		});
	}

	for (const { project } of r) {
		await runCustomCommand(rush, project, options);
	}
}
