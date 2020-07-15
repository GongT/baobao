import { buildAction } from '../common/buildAction';
import { description } from '../common/description';

/** @internal */
export default async function build(argv: string[]) {
	buildAction('build', argv);
}

description(build, 'Run `rush build` without output.');
