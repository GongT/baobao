import debug from 'debug';

const log = debug('executer');
if (globalThis.__ts_resolver_installed__) {
	// nothing to do
	log('resolver already installed before register.ts');
} else if (!process.execArgv.includes('--experimental-transform-types') && !process.env.NODE_OPTIONS?.includes('--experimental-transform-types')) {
	if (process.env._PREVENT_LOOP_) {
		console.error(process.execArgv);
		console.error(process.env.NODE_OPTIONS);
		throw new Error('Loop detected in loader.ts');
	}

	console.error(`current argv = %s`, process.execArgv);
	console.error(`current NODE_OPTIONS = %s`, process.env.NODE_OPTIONS);

	const NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --experimental-transform-types --disable-warning=ExperimentalWarning`;
	if (process.execve) {
		console.error('replacing process with NODE_OPTIONS: %s', NODE_OPTIONS);
		process.execve(process.execPath, [process.argv[0], ...process.execArgv, ...process.argv.slice(1)], {
			...process.env,
			_PREVENT_LOOP_: '1',
			NODE_OPTIONS,
		});
	} else {
		console.error('relaunching process with NODE_OPTIONS: %s', NODE_OPTIONS);
		const { execa } = await import('execa');
		const r = await execa(process.execPath, [...process.execArgv, ...process.argv.slice(1)], {
			stdio: 'inherit',
			env: {
				...process.env,
				_PREVENT_LOOP_: '1',
				NODE_OPTIONS,
			},
		});
		process.exit(r.exitCode ?? 100);
	}

	throw new Error('Failed to relaunch process with experimental transform types');
} else {
	log('registering resolver...');
	await import('./loader.hooks.ts');
}
