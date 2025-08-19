import { functionToDisposable, registerGlobalLifecycle, sleep } from '@idlebox/common';
import { registerNodejsExitHandler } from '../lib/autoindex.js';

registerNodejsExitHandler();

let i = 0;
const tmr = setInterval(() => {
	console.log('i:', i++);
}, 1000);

registerGlobalLifecycle(
	functionToDisposable(() => {
		console.log('dispose!!!', i);
		clearInterval(tmr);
	}),
);

registerGlobalLifecycle(
	functionToDisposable(async () => {
		console.log('dispose 5s ~');
		return sleep(5000);
	}),
);
