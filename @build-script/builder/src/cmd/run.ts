import { resolve } from 'path';
import { PathEnvironment, trySpawnInScope } from '@idlebox/node';
import { BuildContext } from '../common/buildContext';

export default async function runBuildScript() {
	const command = process.argv[2]!;

	require(resolve(__dirname, '../../api')); // init singleton

	const context = new BuildContext(process.cwd());

	if (process.cwd() !== context.projectRoot) {
		process.chdir(context.projectRoot);
	}

	const PATH = new PathEnvironment();
	PATH.add('./node_modules/.bin');
	PATH.add('./common/temp/node_modules/.bin');
	PATH.save();
	trySpawnInScope(['gulp', command]);
}
