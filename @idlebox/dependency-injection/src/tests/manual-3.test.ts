import { globalInjector } from '../common/global.js';
import { createInjectToken, type IInjectable } from '../common/types.js';
import { injectConstructorDependency, makeClassInjectable } from '../common/undecorated.js';

const AToken = createInjectToken<typeof A>('A');
const BToken = createInjectToken<typeof B>('B');
const CToken = createInjectToken<typeof C>('C');

class A implements IInjectable {
	readonly __brand = undefined;

	static {
		makeClassInjectable(A, { cacheable: true });
	}

	readonly rand: string;

	constructor(public readonly a: A) {
		console.log('constructor of A');
		this.rand = (Math.random() * 10000).toFixed(0);
	}
}

abstract class BIndirect implements IInjectable {
	readonly __brand = undefined;

	static {
		makeClassInjectable(BIndirect, { cacheable: false });
	}
}

class B extends BIndirect implements IInjectable {
	static {
		makeClassInjectable(B);
		injectConstructorDependency(B, AToken);
	}

	readonly rand: string;

	constructor(public readonly a: A) {
		super();
		console.log('constructor of B');
		this.rand = (Math.random() * 10000).toFixed(0);
	}
}

class C implements IInjectable {
	readonly __brand = undefined;

	static {
		makeClassInjectable(C);
		injectConstructorDependency(C, AToken, BToken);
	}

	constructor(
		public readonly a: A,
		public readonly b: B,
	) {}

	say() {
		console.log('A created with %d', this.a.rand);
		console.log('B created with %d', this.b.rand);
	}
}

const di = globalInjector.fork();
di.registerService(AToken, A);
di.registerService(BToken, B);
di.registerService(CToken, C);

const c1 = await di.createInstance(CToken);
c1.say();

const c2 = await di.createInstance(CToken);
c2.say();

const c3 = await di.createInstance(CToken);
c3.say();
