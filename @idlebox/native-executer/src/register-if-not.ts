import debug from 'debug';

// let isBuildMode = import.meta.env?.PROD ?? false;

const log = debug('executer');
if (Object.hasOwn(globalThis, Symbol.for('native-executer'))) {
	// nothing to do
	log('在register-if-not.ts前已经注册过了');
} else {
	log('载入 really-register');
	await import('./really-register.js');
}
