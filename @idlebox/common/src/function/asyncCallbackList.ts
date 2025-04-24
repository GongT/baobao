import { nameFunction } from './functionName.js';

export interface MyAsyncCallback<Argument extends unknown[]> {
	displayName?: string;

	(...param: Argument): Promise<undefined | undefined | boolean> | undefined | undefined | boolean;
}

/**
 * like CallbackList, but async
 */
export class AsyncCallbackList<Argument extends unknown[]> {
	protected list: MyAsyncCallback<Argument>[] = [];
	protected running = false;

	constructor() {
		this.run = (this.run as any).bind(this);
	}

	count() {
		return this.list.length;
	}

	reset() {
		if (this.running) {
			throw new Error("Can not reset when it's running.");
		}
		this.list.length = 0;
	}

	/**
	 * @param name optional name of `item` (will assign displayName to `item`)
	 * @returns function list length
	 */
	add(item: MyAsyncCallback<Argument>, name?: string): number {
		if (this.running) {
			throw new Error("Can not add callback when it's running.");
		}
		if (name) {
			nameFunction(name, item);
		}
		return this.list.push(item);
	}

	/**
	 * @returns if removed: return `item`; if did not exists: return null
	 */
	remove(item: MyAsyncCallback<Argument>): null | MyAsyncCallback<Argument> {
		if (this.running) {
			throw new Error("Can not remove callback when it's running.");
		}
		const found = this.list.indexOf(item);
		if (found !== -1) {
			return this.list.splice(found, 1)[0]!;
		}
		return null;
	}

	/**
	 * Stop run if one callback return `true`
	 * @returns {boolean} true if one callback return true
	 */
	async run(...argument: Argument): Promise<boolean> {
		this.running = true;
		let ret: boolean | undefined | undefined;
		for (const cb of this.list) {
			ret = await cb(...argument);
			if (ret === true) {
				break;
			}
		}
		this.running = false;
		return ret || false;
	}
}
