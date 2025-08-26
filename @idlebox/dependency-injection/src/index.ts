export type { DependencyInjector as DependencyInjector } from './common/core.js';
export { globalInjector } from './common/global.js';
export { createInjectToken, initialization, type IInjectable, type IInjectableClass, type InjectableToken } from './common/types.js';
export {
	injectConstructorDependency,
	isClassInjectable,
	makeClassInjectable,
} from './common/undecorated.js';
