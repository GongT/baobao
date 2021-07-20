import { createRequire } from 'module';
import { resolve } from 'path';
import { PathEnvironment, trySpawnInScope } from '@idlebox/node';
import { BuildContext } from '../common/buildContext';
import { ModuleKind } from '../global';

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
	const targetRequire = createRequire(resolve(context.projectRoot, 'package.json'));
	const gulpBin = targetRequire.resolve('gulp/bin/gulp.js');

	// console.error('!!!!!!!!!!!!!', context.kind);
	if (context.kind === ModuleKind.ESNext) {
		process.env.TS_NODE_PROJECT = require.resolve('../../tsconfig-collect/esm.json');
		const noWarning = [];
		if (process.stderr.isTTY) {
			noWarning.push('--no-warnings');
		}

		trySpawnInScope(['node', ...noWarning, '--loader', 'ts-node/esm', gulpBin, command]);
	} else {
		process.env.TS_NODE_PROJECT = require.resolve('../../tsconfig-collect/cjs.json');
		trySpawnInScope(['node', gulpBin, command]);
	}
}
