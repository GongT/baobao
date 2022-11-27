import { createRequire } from 'module';
const require = createRequire(import.meta.url);

console.log('\x1B[48;5;10;7mtry import\x1B[0m');
import('./test0')
	.then((data: any) => {
		console.log('import() success');

		if (typeof data.default !== 'function') {
			throw new Error('esm exported not function');
		}
	})
	.then(() => {
		console.log('try require');
		const data = require('../register.cjs');
		console.log('require() ok');

		if (typeof data.default !== 'function') {
			throw new Error('cjs exported not function');
		}
	})
	.then(async () => {
		console.log('try require test');
		require('./test1.cjs');
		console.log('require() ok');

		console.log('try import test');
		await import('./test1.js');
		console.log('import() ok');
	})
	.then(async () => {
		console.log('try test 2');
		require('./test2.cjs');
		await import('./test2.js');
		console.log('test 2 ok');
	})
	.catch((e: any) => {
		console.error('Test failed:');
		console.dir(e.stack);
		process.exit(1);
	});
