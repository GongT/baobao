import { nameObject } from '../../debugging/object-with-name.js';

export function bindThis(method: Function, context: ClassMethodDecoratorContext) {
	if (context.kind !== 'method') throw new Error(`this decorator can only be applied to classes`);

	if (context.static) throw new TypeError('this decorator not supported on static methods.');
	if (context.private) {
		return nameObject(`${context.name.toString()}.bounded`, function (this: any, ...args: any[]) {
			return method.apply(this, args);
		});
	} else {
		context.addInitializer(function (this: any) {
			this[context.name] = nameObject(`${context.name.toString()}.bounded`, method.bind(this));
		});
		return undefined;
	}
}
