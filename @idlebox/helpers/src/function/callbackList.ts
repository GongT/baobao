import { nameFunction } from './functionName';

export interface MyCallback<Argument> {
	displayName?: string;

	(param: Argument): void | undefined | boolean;
}

export class CallbackList<Argument> {
	protected list: MyCallback<Argument>[] = [];

	add(item: MyCallback<Argument>, name?: string) {
		if (name) {
			nameFunction(name, item);
		}
		return this.list.push(item);
	}

	remove(item: MyCallback<Argument>) {
		const found = this.list.indexOf(item);
		if (found !== -1) {
			return this.list.splice(found, 1);
		}
		return [];
	}

	run(argument: Argument) {
		return this.list.some((cb) => {
			const ret = cb(argument);
			return ret === undefined || ret;
		});
	}
}
