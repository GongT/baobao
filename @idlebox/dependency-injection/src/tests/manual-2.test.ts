import { globalInjector } from '../common/global.js';
import type { IInjectable } from '../common/types.js';

class X implements IInjectable {}

class SingletonClass implements IInjectable {
	readonly __brand = undefined;

	constructor(
		// public readonly a: string,
		protected readonly someDep: X,
	) {
		console.log('constructor of SingletonClass');
	}
}
const sToken = globalInjector.registerSingletonService<typeof SingletonClass>(SingletonClass);
console.log('sToken', sToken);
globalInjector.instance(sToken);
