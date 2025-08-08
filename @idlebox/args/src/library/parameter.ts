import type { InspectOptions } from 'node:util';
import { die } from '../tools/assert.js';
import { customInspectSymbol, wrapStyle } from '../tools/color.js';
import { isFlags, isRange, type IParamDesc } from '../tools/param-desc.js';
import { ParamKind, type IParameter, type ParameterDefinition } from '../types.js';
import { Conflict, StackTrace } from './errors.js';
import type { TToken } from './token.js';

/**
 * 一组相关token的集合，例如 --verbose -a=1 -v 中的 --verbose 和 -v
 */
export class Parameter implements IParameter {
	public readonly firstUsageStack: StackTrace;
	private _kind: undefined | ParamKind;

	constructor(private readonly _definition: IParamDesc) {
		this.firstUsageStack = new StackTrace(undefined, 2);
	}

	get _id(): string {
		return this._definition.id;
	}

	get definition(): ParameterDefinition {
		if (isFlags(this._definition)) {
			return this._definition.flags;
		} else if (isRange(this._definition)) {
			return [this._definition.from, this._definition.to];
		} else {
			return {
				commands: this._definition.cmd,
				level: this._definition.level,
			};
		}
	}

	private _tokens: TToken[] = [];
	get tokens(): readonly TToken[] {
		return this._tokens;
	}

	get kind(): ParamKind {
		return this._kind || ParamKind.unknown;
	}

	bindArgType(type: ParamKind, args: TToken[]) {
		if (this._kind !== undefined && this._kind !== ParamKind.unknown && this._kind !== type) {
			die(`parameter ${this._id} already has a kind: ${ParamKind[this._kind]}`);
		}

		for (const token of args) {
			const bound = token.getBinding();
			if (!bound) continue;

			if (bound !== this) {
				throw new Conflict(bound, this);
			}
		}

		this._kind = type;
		this._tokens = args;
		for (const token of args) {
			token.bindTo(this);
		}
	}

	[customInspectSymbol](_depth: number, inspectOptions: InspectOptions /*_inspect: typeof node_inspect*/) {
		let ret = wrapStyle(inspectOptions.colors, '2', '<', '0');
		const name = wrapStyle(inspectOptions.colors, '38;5;12', this.constructor.name, '0');
		ret += name;
		ret += wrapStyle(inspectOptions.colors, '2', ` ${this._id}>`, '0');
		return ret;
	}
}
