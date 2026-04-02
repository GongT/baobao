import debug from 'debug';

const log = debug('executer');
if (Object.hasOwn(globalThis, Symbol.for('native-executer'))) {
	// nothing to do
	log('resolver already installed before register');
} else {
	log('registering resolver...');

	if (process.execArgv.includes('--inspect')) {
		const ins = await import('node:inspector');
		ins.waitForDebugger();
	}

	await import('./really-register.ts');
}
