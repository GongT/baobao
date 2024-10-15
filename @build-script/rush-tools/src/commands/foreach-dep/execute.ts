import { createDeps, RushProject } from '../../api';
import { shiftArgumentFlag } from '../../common/arguments';
import { description } from '../../common/description';
import { parseForeachCommand, runCustomCommand } from '../../common/foreachAction';

/** @internal */
export default async function runForEach(input: string[]) {
	const buildOnly = shiftArgumentFlag(input, 'build');
	const publicOnly = shiftArgumentFlag(input, 'public');
	const options = parseForeachCommand(input, ['build', 'public']);
	const rush = new RushProject();
	const deps = createDeps(rush);

	let r = deps.overallOrder().map((e) => deps.getNodeData(e));

	if (buildOnly) {
		r = r.filter((e) => e.hasBuildScript);
	}
	if (publicOnly) {
		r = r.filter((e) => {
			if (!e.project.shouldPublish) return false;
			return !e.packageJson.private;
		});
	}

	for (const { project } of r) {
		await runCustomCommand(rush, project, options);
	}
}

description(runForEach, 'Run a command in every project directory, with dependency order.');
