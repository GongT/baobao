import type { AnyClass, InjectableToken } from './types.js';

interface IContext {
	services: Record<InjectableToken<any>, any>;
}
const context_stack: IContext[] = [];

function _get_current_context() {
	return context_stack.at(-1);
}

export function _push_context(ctx: IContext) {
	context_stack.push(ctx);
}

export function _pop_context(ctx: IContext) {
	const pop = context_stack.pop();
	if (pop !== ctx) throw new Error('Context stack corrupted');
}

export function inject<T extends AnyClass>(Class: InjectableToken<T>): InstanceType<T> {
	const ctx = _get_current_context();
	if (!ctx) throw new Error('No context available');
	const instance = ctx.services[Class];
	if (!instance) throw new Error(`Service not found for ${String(Class)}`);
	return instance;
}
