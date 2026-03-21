import { humanReadable, type IHumanReadable } from './human-readable.js';

/**
 * 利用try...catch统一接口，或是用于分支条件等，未发生错误的情况
 */
export class NotError implements IHumanReadable {
	constructor(public readonly extra_message: string = '') {}

	get stack() {
		throw new Error(`NotError 未被正确捕获 [hint: ${this.extra_message}]`);
	}
	get message() {
		throw new Error(`NotError 未被正确捕获 [hint: ${this.extra_message}]`);
	}

	[humanReadable]() {
		return `你不应该看到此消息。你无需尝试处理该错误，请联系开发者。[hint: ${this.extra_message}]`;
	}
}
