import { DependencyInjector } from './core.js';
import { createInjectToken, getClassMeta, type GetLeadingNonServiceArgs, type IInjectableClass, type InjectableToken } from './types.js';

type NotAllowStaticParam<T, K> = `Cannot use static parameter in registerSingletonService, class: ${T & string}, parameter: ${K & string}`;
type MayInjectableToken<T extends IInjectableClass> = GetLeadingNonServiceArgs<ConstructorParameters<T>> extends []
	? InjectableToken<T>
	: NotAllowStaticParam<T, GetLeadingNonServiceArgs<ConstructorParameters<T>>>;

class GlobalDependencyInjector extends DependencyInjector {
	registerSingletonService<T extends IInjectableClass>(Class: T): MayInjectableToken<T> {
		if (!Class.name) {
			throw new Error(`can not register class without name`);
		}
		const token = createInjectToken<T>(Class.name);

		const meta = getClassMeta(Class);
		if (!meta) {
			throw new Error(`Class ${Class.name} is not marked as injectable.`);
		}

		if (meta.options.cacheable === false) {
			throw new Error(`Class ${Class.name} is marked as non-cacheable, cannot register as singleton.`);
		}

		this.registerService(token, Class as any);

		return token as any;
	}

	/** @internal */
	static create(): GlobalDependencyInjector {
		return new GlobalDependencyInjector();
	}
}

export const globalInjector = GlobalDependencyInjector.create();
