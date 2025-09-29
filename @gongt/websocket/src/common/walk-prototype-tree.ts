type AnyClass = Function | (new (...args: any) => any);

/**
 * 递归遍历类的原型链，直到遇到边界类为止
 * 用于分析每个父类的属性和方法
 * @param Class 要遍历的类（不是对象）
 * @param boundaryClass 边界（不包含），默认是 Object
 */
export function* walkPrototypeTree(Class: AnyClass, boundaryClass?: AnyClass) {
	let current = Class;
	// const boundaryPrototype = Object.getPrototypeOf(boundaryClass);

	while (current && current !== boundaryClass) {
		if (!current.prototype) {
			// Object的prototype是undefined
			return;
		}
		yield [current.name, current.prototype];
		current = Object.getPrototypeOf(current);
	}
}

// class A {
// 	a() {}
// }
// class B extends A {
// 	b = 123;
// }
// class C extends B {
// 	override a() {
// 		super.a();
// 	}

// 	c() {}
// }

// class D {}

// for (const [name, cls] of walkPrototypeTree(C,A)) {
// 	console.log('level: [%s]', name, cls.a, cls.b, cls.c);
// }
