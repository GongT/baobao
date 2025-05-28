import type { ArgsReader } from './args-reader.js';
import { customInspectSymbol, wrapStyle } from './functions.js';
import { ArgKind, type IArgument } from './tokens-match.js';
import { tokenToString, type Token } from './tokens.js';

function matchPos(index: number, token?: Token, arg?: IArgument) {
	if (token?.index === index) return true;
	if (!arg) return false;

	for (const item of arg.tokens) {
		if (item.index === index) return true;
	}
	return false;
}

export class ArgumentError extends Error {}

export abstract class AbstractArgumentError extends ArgumentError {
	public override readonly name: string;
	public readonly _stackObject: { readonly stack: string };
	public readonly arg?: IArgument;

	constructor(
		public readonly token?: Token,
		arg?: IArgument
	) {
		if (!arg && !token) {
			throw new Error('either token or arg must be provided');
		}
		super(`unknown argument error`);

		this._stackObject = {} as any;
		Error.captureStackTrace(this._stackObject, this.constructor);

		this.name = this.constructor.name;

		if (arg) {
			this.arg = arg;
		} else if (token) {
			this.arg = token.bindingArgument;
		}

		(this as any).message = undefined;
		(this as any).stack = undefined;

		// Object.defineProperties(this, {
		// 	message: {
		// 		configurable: true,
		// 		enumerable: true,
		// 		get: () => {},
		// 	},
		// 	stack: {
		// 		configurable: true,
		// 		enumerable: true,
		// 		get: () => {
		// 		},
		// 	},
		// });
	}

	protected abstract get _message(): string;
	override get message() {
		const message = `${this.name}: ${this._message}\n  ${this.explainArgs}`;
		Object.defineProperty(this, 'message', {
			value: message,
			configurable: false,
			writable: false,
			enumerable: true,
		});
		return message;
	}

	override get stack() {
		let stack = this._stackObject.stack.slice(this._stackObject.stack.indexOf('\n') + 1);
		stack = `${this.message}\n${stack}`;
		Object.defineProperty(this, 'stack', {
			value: stack,
			configurable: false,
			writable: false,
			enumerable: true,
		});
		return stack;
	}

	get parser() {
		return (this.token || this.arg)?.parser as ArgsReader;
	}

	protected get explainArgs() {
		const color = shouldWriteColor();

		let explainArgs = color ? '\x1B[0m' : '';
		for (const [index, param] of this.parser.params.entries()) {
			if (matchPos(index, this.token, this.arg)) {
				explainArgs += wrapStyle(color, '38;5;9;1', `>>>${param}<<<`, '0');
			} else {
				explainArgs += wrapStyle(color, '3', param, '0');
			}
			explainArgs += ' ';
		}

		Object.defineProperty(this, 'explainArgs', {
			value: explainArgs,
			configurable: false,
			writable: false,
			enumerable: true,
		});
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
export class UnexpectedArgument extends AbstractArgumentError {
	constructor(
		token: Token,
		private readonly extra: string
	) {
		super(token);
	}

	get _message() {
		return `unexpected argument: ${tokenToString(this.token!)}: ${this.extra}`;
	}
}

export class UncontinuousPositionalArgument extends UnexpectedArgument {
	constructor(
		public readonly last: Token,
		curr: Token
	) {
		super(curr, 'positional argument must continuous');
	}
}

export interface IUsedBy {
	readonly argument: IArgument;
	readonly stack: StackTrace;
}
/**
 * 以不同方式用同一个参数
 *    之前是位置[2:]，现在是位置[3:]
 *    之前是--option >>value<<，现在是位置参数
 *    之前是[--flag]，现在是[--flag=value]
 */
export class ConflictArgument extends AbstractArgumentError {
	public declare readonly arg: IArgument;

	constructor(
		protected readonly _message: string,
		arg: IArgument,
		token?: Token
	) {
		super(token, arg);
	}

	override get stack() {
		if (this.token) {
			const color = shouldWriteColor();

			const firstUsage = this.token.bindingArgument?.firstUsageStack;
			const f_stack = firstUsage?.stack ?? '***no stack info***';
			return `${super.stack}\n${wrapStyle(color, '38;5;11', 'Previouse usage:', '39;2')}\n${f_stack}`;
		}
		return super.stack;
	}
}

export function bindArgType(arg: IArgument, type: ArgKind) {
	if (arg.kind && arg.kind !== type) {
		const msg = `confilict usage: ${ArgKind[arg.kind]} is used again as ${ArgKind[type]}`;
		throw new ConflictArgument(msg, arg);
	}

	for (const token of arg.tokens) {
		if (token.bindingArgument && token.bindingArgument !== arg) {
			const msg = `confilict usage: ${tokenToString(token)} is used by ${token.bindingArgument._id}, and requested again as ${arg._id}`;
			throw new ConflictArgument(msg, arg, token);
		}
		token.bindingArgument = arg;
	}

	Object.assign(arg, { kind: type });
}

export class StackTrace extends Error {
	declare readonly stack: string;

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
