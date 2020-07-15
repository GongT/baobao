import { buildAction } from '../common/buildAction';
import { description } from '../common/description';

/** @internal */
export default async function rebuild(argv: string[]) {
	buildAction('rebuild', argv);
}

description(rebuild, 'Run `rush rebuild` without output.');
