import { die } from '../tools/assert.js';
import { customInspectSymbol, wrapStyle } from '../tools/color.js';
import { ParamKind } from '../types.js';
import { Parameter } from './parameter.js';
import type { TToken } from './token.js';

function matchPos(index: number, arg?: TToken, param?: Parameter) {
	if (arg?.index === index) return true;
	if (!param) return false;

	for (const item of param.tokens) {
		if (item.index === index) return true;
	}
	return false;
}

export abstract class BaseError extends Error {
	protected abstract _getMessage(): string;
	protected abstract explain(): string;
	private readonly _stackObject: StackTrace;

	constructor(skip = 1) {
		super(`unknown argument error (you should not see this)`);

		this.name = this.constructor.name;
		this._stackObject = new StackTrace(undefined, 1 + skip);

		// // biome-ignore lint/performance/noDelete: 必须删除，否则会阻碍get message被调用
		// delete (this as any).message;
		// // biome-ignore lint/performance/noDelete: 必须删除，否则会阻碍get stack被调用
		// delete (this as any).stack;

		Object.defineProperties(this, {
			message: {
				configurable: false,
				enumerable: true,
				get: () => {
					return this.getMessage();
				},
			},
			stack: {
				configurable: false,
				enumerable: true,
				get: () => {
					return this.getStack();
				},
			},
		});
	}

	private getMessage() {
		return `${this.name}: ${this._getMessage()}\n${this.explain()}`;
	}

	/**
	 * 此方法不会执行
	 * @deprecated 知道是ArgumentError，应该使用`getStack()`方法获取堆栈信息
	 */
	override get stack() {
		die('shadowed function got called.');

		// @ts-expect-error
		return this.getStack();
	}

	/**
	 * 此方法不会执行
	 * @deprecated 知道是ArgumentError，应该使用`getMessage()`方法获取信息
	 */
	override get message() {
		die('shadowed function got called.');

		// @ts-expect-error
		return this.getMessage();
	}

	getStack() {
		return this._stackObject.getStack();
	}
}

abstract class AbstractParameterError extends BaseError {
	constructor(
		public readonly parameter: Parameter,
		skip = 1,
	) {
		super(skip + 1);
	}
}

abstract class AbstractArgumentError extends BaseError {
	public override readonly name: string;

	constructor(
		public readonly token: TToken,
		skip = 1,
	) {
		super(skip + 1);

		this.name = this.constructor.name;
	}

	get parser() {
		return this.token.getParser();
	}

	protected explain() {
		const color = shouldWriteColor();

		let explainArgs = color ? '\x1B[0m' : '';
		for (const [index, param] of this.parser.arguments.entries()) {
			if (matchPos(index, this.token, this.token.getBinding())) {
				explainArgs += wrapStyle(color, '38;5;9;4:3', param.toString(), '0');
			} else {
				explainArgs += wrapStyle(color, '3', param.toString(), '0');
			}
			explainArgs += ' ';
		}
		return explainArgs;
	}
}

/**
 * 多余参数：
 *   - 要求单个参数，但是读取到了多个
 *   - 要求flag但有值
 *   - 位置参数不连续
 *   - 位置参数和子命令冲突
 */
export class Unexpected extends AbstractArgumentError {
	constructor(
		token: TToken,
		private readonly extra: string,
		skip = 1,
	) {
		super(token, 1 + skip);
	}

	protected override _getMessage() {
		return `${this.token?.toString()}: ${this.extra}`;
	}
}

export class UnexpectedCommand extends Unexpected {
	constructor(token: TToken, commands: readonly string[], skip = 1) {
		super(token, `unexpected command, expected one of: ${commands.join(', ')}`, skip + 1);
	}
}

export class Uncontentious extends Unexpected {
	constructor(
		public readonly last: TToken,
		curr: TToken,
		skip = 1,
	) {
		super(curr, 'positional argument must continuous', 1 + skip);
	}
}

export interface IUsedBy {
	readonly argument: Parameter;
	readonly stack: StackTrace;
}
/**
 * 以不同方式用同一个参数
 *    之前是位置[2:]，现在是位置[3:]
 *    之前是--option >>value<<，现在是位置参数
 *    之前是[--flag]，现在是[--flag=value]
 */
export class Conflict extends AbstractParameterError {
	constructor(
		prev: Parameter,
		private readonly curr: Parameter,
		skip = 1,
	) {
		super(prev, 1 + skip);
	}

	protected override _getMessage(): string {
		if (this.curr.kind !== ParamKind.unknown && this.parameter.kind !== this.curr.kind) {
			return `conflicts usage: ${ParamKind[this.parameter.kind]} is used again as ${ParamKind[this.curr.kind]}`;
		} else {
			return `conflicts usage: ${this.parameter._id} is used again as ${this.curr._id}`;
		}
	}

	protected override explain(): string {
		const color = shouldWriteColor();

		const f_stack = this.parameter.firstUsageStack?.getStack() ?? '***no stack info***';
		return `${wrapStyle(color, '38;5;11', 'Previous usage:', '39;2')}\n${f_stack}\n--`;
	}
}

export class StackTrace {
	private declare readonly stack: string;

	constructor(
		private readonly attchMessage?: string,
		private readonly skip = 1,
	) {
		Error.captureStackTrace(this);
	}

	getStack() {
		let s = this.stack
			.split('\n')
			.slice(this.skip + 1)
			.join('\n');
		if (this.attchMessage) {
			return `${this.attchMessage}\n${s}`;
		} else {
			return s;
		}
	}

	[customInspectSymbol]() {
		return '<StackTrace>';
	}
}
function truthy(value: string | undefined) {
	return value === '1' || value === 'true' || value === 'on' || value === 'yes';
}

function shouldWriteColor() {
	if (typeof process.env.FORCE_COLOR === 'undefined') {
		return !truthy(process.env.NODE_DISABLE_COLORS);
	}
	return process.env.FORCE_COLOR !== '0';
}
