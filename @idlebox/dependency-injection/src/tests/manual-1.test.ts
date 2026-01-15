import { sleep } from '@idlebox/common';
import { globalInjector } from '../common/global.js';
import { createInjectToken, initialization, type IInjectable } from '../common/types.js';
import { injectConstructorDependency, makeClassInjectable } from '../common/undecorated.js';

abstract class SayClass implements IInjectable {
	readonly __brand = undefined;

	constructor() {
		console.log('constructor of SayClass');
	}
	abstract say(): string;

	async [initialization]() {
		console.log('initialization of SayClass');
		await sleep(200);
	}
}
const sayToken = createInjectToken<typeof SayClass>('SayClass');

class GamersClass extends SayClass {
	constructor() {
		super();
		console.log('constructor of GamersClass');
	}

	say() {
		return `gamers`;
	}
}

class GreaterClass extends SayClass {
	constructor(private readonly who: string) {
		super();
		console.log('constructor of GreaterClass');
	}

	say() {
		return `${this.who} is the best programming language`;
	}
}

class WorldClass extends SayClass {
	constructor(private readonly hello: string) {
		super();
		console.log('constructor of WorldClass');
	}

	say() {
		return `${this.hello} world`;
	}
}

class ConsumerClass implements IInjectable {
	static {
		makeClassInjectable(ConsumerClass);
		injectConstructorDependency(ConsumerClass, undefined, sayToken);
	}

	readonly __brand = undefined;

	constructor(
		public readonly name: string,
		public readonly sa: SayClass,
	) {
		console.log('constructor of ConsumerClass');
	}

	async [initialization]() {
		console.log('initialization of ConsumerClass');
		await sleep(200);
	}

	callA() {
		return `${this.name} say: ${this.sa.say()}`;
	}
}
const consumerToken = createInjectToken<typeof ConsumerClass>('ConsumerClass');

console.log('--------------- run stage');

console.log('--------------- test 1');
const d1 = globalInjector.fork();
d1.registerService(sayToken, WorldClass, 'Hello');
d1.registerService(consumerToken, ConsumerClass, 'C');
const r1 = await d1.instance(consumerToken);

console.log(r1.callA());

console.log('--------------- test 2');
const d2 = globalInjector.fork();
d2.registerService(sayToken, GamersClass);
await d2.createInstance(ConsumerClass, 'Beasty');
const r2 = await d2.instance(ConsumerClass);

console.log(r2.callA());

console.log('--------------- test 3');
globalInjector.registerService(sayToken, GreaterClass, 'TypeScript');
const d3 = globalInjector.fork();
await d3.createInstance(ConsumerClass, 'everyone');
const r3 = await d3.instance(ConsumerClass);

console.log(r3.callA());
