import whyIsNodeRunning from 'why-is-node-running';
import { dispose, execute } from '../../loader/index.devel.js';

const tsFile = import.meta.resolve('./index.ts');
console.log('[test] try import by esbuild: %s', tsFile);

const exports = await execute(tsFile, { write: true });

console.log('[test] exports:', exports);

const to = setTimeout(() => {
	console.error('\n\n[test] quit timeout');
	whyIsNodeRunning();
	process.exit(1);
}, 3000);
to.unref();

dispose();
