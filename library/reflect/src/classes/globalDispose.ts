import { AsyncDisposable, Disposable, IDisposable } from '@idlebox/lifecycle';
import { hookClass } from './hookClass';

export function globalDispose(relatedWith: Disposable | AsyncDisposable): ClassDecorator {
	return (target: any): any => {
		const hook = hookClass(target);
		if (!hook.afterConstruct) {
			hook.afterConstruct = [];
		}

		hook.afterConstruct.push((obj) => {
			relatedWith._register(obj as IDisposable);
		});
	};
}
