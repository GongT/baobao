import { EnhancedAsyncDisposable, type MaybeNamedFunction } from '@idlebox/common';
import debug from 'debug';
import {
	debug_stringify,
	getClassMeta,
	initialization,
	noMetadata,
	type AnyClass,
	type AnyConstructor,
	type GetLeadingNonServiceArgs,
	type IInjectable,
	type IInjectableClass,
	type InjectableToken,
} from './types.js';

function nameOf(fn: MaybeNamedFunction): string {
	const name = fn.name || fn.displayName;
	if (!name) {
		throw new Error('can not register class without name');
	}
	return name;
}

/**
 * 用于依赖注入的容器
 */

export class DependencyInjector extends EnhancedAsyncDisposable {
	private readonly instances = new Map<InjectableToken | string, any>();
	private readonly classDefaultArgs = new Map<IInjectableClass, any[]>();
	private readonly classes = new Map<InjectableToken, IInjectableClass>();
	private readonly classesRev = new Map<IInjectableClass, InjectableToken>();

	protected constructor(protected readonly parent?: DependencyInjector) {
		super('di');
	}

	fork() {
		return new DependencyInjector(this);
	}

	/**
	 * @internal
	 */
	protected readonly log = debug('di');

	/**
	 * 注册一个服务
	 */
	registerService<T extends IInjectableClass>(token: InjectableToken<T>, service: InstanceType<T>): void;
	registerService<T extends IInjectableClass>(token: InjectableToken<T>, service: AnyConstructor<InstanceType<T>>): void;
	registerService<T extends IInjectableClass, A extends any[]>(
		token: InjectableToken<T>,
		service: new (...args: A) => InstanceType<T>,
		...args: GetLeadingNonServiceArgs<A>
	): void;
	registerService(token: InjectableToken, service: AnyClass | IInjectable, ...args: any): void {
		if (this.instances.has(token)) throw new Error(`类型 [${debug_stringify(token)}] 已有实例`);
		if (typeof service === 'function') {
			const Class = service;
			this._registerClass(token, Class);
			if (args.length > 0) {
				this.log(`  * add default args for constructor`);
				this.classDefaultArgs.set(Class, args);
			}
		} else {
			const Class: any = service.constructor;
			this._registerClass(token, Class);

			this.log(`  * add instance of it`);

			if (!this.isCacheable(Class)) {
				throw new Error(`类型 [${nameOf(Class)}] 不可缓存，不能以实例方式注册`);
			}

			if (service[initialization]) {
				this.log(`  * call async initialization()`);
				const p = Promise.try(service[initialization].bind(service)).then(
					() => {
						this.log(`done async initialization() of ${nameOf(Class)}`);
						this.instances.set(token, service);
						return service;
					},
					(e) => {
						this.log(`error async initialization() of ${nameOf(Class)}: ${e}`);
						this.instances.delete(token);
						throw e;
					},
				);
				this.instances.set(token, p);
			} else {
				this.instances.set(token, service);
			}
		}
	}

	private isCacheable(Cls: IInjectableClass): boolean {
		const meta = getClassMeta(Cls);
		if (meta?.options.cacheable === false) return false;
		return true;
	}

	private _registerClass<T extends IInjectableClass>(token: InjectableToken<T>, Class: T): void {
		this.log(`register class ${nameOf(Class)} for token ${debug_stringify(token)}`);

		if (this.classes.has(token)) throw new Error(`类型 [${debug_stringify(token)}] 已经注册过了`);
		this.classes.set(token, Class);
		this.classesRev.set(Class, token);
	}

	/**
	 * 无条件创建一个新的实例（它依赖的对象不一定是新的）
	 * 如果从未创建过此类型实例，则还会注册为默认实例
	 */
	async createInstance<T extends IInjectableClass>(cls: InjectableToken<T>, ...args: GetLeadingNonServiceArgs<ConstructorParameters<T>>): Promise<InstanceType<T>>;
	async createInstance<T extends IInjectable>(cls: IInjectableClass<T>, ...args: GetLeadingNonServiceArgs<ConstructorParameters<typeof cls>>): Promise<T>;
	async createInstance(ctor_or_token: AnyClass | InjectableToken, ...args: any[]) {
		if (typeof ctor_or_token === 'function') {
			// class
			return this.create_class(ctor_or_token, args);
		} else {
			// token
			return this.create_instance_inner(ctor_or_token);
		}
	}

	protected findTokenByClass<T extends IInjectableClass>(ctor: T): InjectableToken<T> | undefined {
		const token = this.classesRev.get(ctor);
		if (token) return token;
		return this.parent?.findTokenByClass(ctor);
	}

	protected findClassByToken<T extends IInjectableClass>(token: InjectableToken<T>): { ctor: T; args: any[] } | undefined {
		const ctor = this.classes.get(token);
		if (ctor) return { ctor: ctor as any, args: this.classDefaultArgs.get(ctor) ?? [] };
		return this.parent?.findClassByToken(token);
	}

	protected findInstanceByToken<T extends IInjectableClass>(token: InjectableToken<T> | string): InstanceType<T> | undefined {
		if (this.instances.has(token)) {
			return this.instances.get(token);
		}
		return this.parent?.findInstanceByToken(token);
	}

	/**
	 * 获取一个实例，如果没有就创建一个默认实例，如果还是没有则抛出异常
	 */
	async instance<T extends IInjectableClass>(token: InjectableToken<T>): Promise<InstanceType<T>>;
	async instance<T extends IInjectable>(ctor: IInjectableClass<T>): Promise<T>;
	instance(ctor_or_token: InjectableToken | IInjectableClass): Promise<any> {
		if (typeof ctor_or_token === 'function') {
			const tokenName = this.findTokenByClass(ctor_or_token) ?? nameOf(ctor_or_token);

			const exists = this.findInstanceByToken(tokenName);
			if (exists) {
				return Promise.resolve(exists);
			}

			return this.create_class(ctor_or_token, []);
		} else {
			return this.get_or_create_instance(ctor_or_token);
		}
	}

	private create_class(Cls: IInjectableClass, args: any[]) {
		const tokenName = this.findTokenByClass(Cls) ?? nameOf(Cls);

		let p = this.create_class_inner(Cls, args);
		if (!this.instances.has(tokenName) && this.isCacheable(Cls)) {
			this.instances.set(tokenName, p);
			p = p.then(
				(instance) => {
					this.instances.set(tokenName, instance);
					return instance;
				},
				(e) => {
					this.instances.delete(tokenName);
					throw e;
				},
			);
		}

		return p;
	}
	private async create_class_inner(Cls: IInjectableClass, args: any[]) {
		this.log(`create class: ${nameOf(Cls)}`);
		const meta = getClassMeta(Cls);
		if (meta?.dependencies) {
			this.log(`  * has ${meta.dependencies.length} dependencies, start from ${meta.dependencyStart}`);
			if (meta.dependencyStart !== args.length) {
				throw new Error(`无法创建类型 [${nameOf(Cls)}] 的实例: 参数数量不正确（应提供 ${meta.dependencyStart} 个，实际获得 ${args.length} 个）`);
			}
			for (const dep of meta.dependencies) {
				this.log(`  * initialize dependency [${debug_stringify(dep)}]`);
				const depInstance = await this.get_or_create_instance(dep);
				args.push(depInstance);
			}
		}
		const instance = Reflect.construct(Cls, args);

		if (instance[initialization]) {
			this.log(`  * execute ${nameOf(Cls)}.[initialization]()`);
			await instance[initialization]();
		}

		return instance;
	}

	private get_or_create_instance<T extends IInjectableClass>(token: InjectableToken<T>): any {
		const exists = this.findInstanceByToken(token);
		if (exists) {
			return exists;
		}

		return this.create_instance_inner(token);
	}

	private async create_instance_inner<T extends IInjectableClass>(token: InjectableToken<T>): Promise<InstanceType<T>> {
		this.log(`create instance: ${debug_stringify(token)}`);

		const descriptor = this.findClassByToken(token);
		if (!descriptor) throw new Error(`无法获取类型 [${debug_stringify(token)}] 的实例: 该类型没有被注册过`);

		const desc = getClassMeta(descriptor.ctor) ?? noMetadata;
		if (desc.dependencyStart >= 0) {
			this.log(`  * has ${desc.dependencies.length} dependencies, start from ${desc.dependencyStart}`);
			if (descriptor.args.length === desc.dependencyStart) {
				this.log(`  * has default arguments`);
			} else {
				throw new Error(
					`无法创建类型 [${debug_stringify(token)}] 的实例: 构造函数存在 ${desc.dependencyStart} 个非服务类型的参数，实际获得 ${descriptor.args.length} 个`,
				);
			}
		}

		const instance = this.create_class(descriptor.ctor, descriptor.args);
		return instance as Promise<InstanceType<T>>;
	}
}
