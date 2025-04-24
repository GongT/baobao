import { setErrorLogRoot } from '@idlebox/common';
import { runMain } from '@idlebox/node';
import { fileURLToPath } from 'node:url';
import { startServe } from './actions/serve.js';
import { execute } from './build/index.js';
import { emitComplete } from './library/wait.js';

const argv = process.argv.slice(2);

setErrorLogRoot(import.meta.filename || fileURLToPath(import.meta.url));
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
