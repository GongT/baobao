import { resolve } from 'path';
import { runMain } from '@idlebox/node';
import { setErrorLogRoot } from '@idlebox/common';
import { startServe } from './actions/serve';
import { execute } from './build/index';
import { emitComplete } from './library/wait';

const argv = process.argv.slice(2);

setErrorLogRoot(resolve(__dirname, '..'));
switch (argv[0]) {
	case 'build':
		runMain(() => execute(false));
		break;
	case 'watch':
		execute(true);
		break;
	case 'serve':
		runMain(startServe);
		break;
	case 'notify':
		emitComplete();
		break;
}
