declare const global: any;
declare const window: any;

const globalSymbol = Symbol.for('fix-esm');
const activeSymbol = Symbol.for('fix-esm:active');

const ctx = typeof global === 'undefined' ? window : global;

function loadOnce() {
	if (!ctx[globalSymbol]) {
		// console.error('[fix-esm] load');
		ctx[globalSymbol] = module.require('fix-esm');
		ctx[globalSymbol][activeSymbol] = 0;
	}
	return ctx[globalSymbol];
}

export function register() {
	const mdl = loadOnce();
	mdl[activeSymbol]++;
	if (mdl[activeSymbol] !== 1) {
		return;
	}
	// console.error('[fix-esm] register');
	mdl.register();
}

export function unregister() {
	const mdl = loadOnce();
	mdl[activeSymbol]--;
	if (mdl[activeSymbol] !== 0) {
		return;
	}
	// console.error('[fix-esm] unregister');
	mdl.unregister();
}

// @ts-ignore
export function require(id: string) {
	const { createRequire } = module.require('module');
	const { isAbsolute } = module.require('path');

	const mdl = loadOnce();
	if (mdl[activeSymbol] === 0) {
		register();
	}
	const frame = new Error().stack!.split('\n', 3)[2]!.trim();
	const file = frame
		.replace(/^at /, '')
		.replace(/^.+ \(/, '')
		.replace(/\)$/, '')
		.replace(/(:\d)+$/, '');

	if (!isAbsolute(file)) {
		console.error('can not get absolute path from upper frame: %s', file);
	}

	const require = createRequire(file);
	return require(id);
}
