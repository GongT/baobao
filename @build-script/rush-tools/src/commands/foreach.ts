import { RushProject } from '../api/rushProject';
import { description } from '../common/description';
import { parseForeachCommand, runCustomCommand } from '../common/foreachAction';

/** @internal */
export default async function runForEach(input: string[]) {
	const options = parseForeachCommand(input);

	const rush = new RushProject();
	for (const project of rush.projects) {
		await runCustomCommand(rush, project, options);
	}
}

description(runForEach, 'Run a command in every project directory.');
