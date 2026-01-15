import type { InspectOptionsStylized, inspect as node_inspect } from 'node:util';
import { ParamKind } from '../constants.js';
import { customInspectSymbol, wrapStyle } from '../tools/color.js';
import { normalizeParameterDescription } from '../tools/param-desc.js';
import type { ISubArgsReaderApi, IParamDefineCommand, IParamDefineFlag } from '../types.js';
import { UnexpectedCommand } from './errors.js';
import type { Parameter } from './parameter.js';
import type { ApplicationArguments } from './reader.app.js';
import type { ValueToken } from './token.js';

export class CommandArguments<T extends string = string> implements ISubArgsReaderApi {
	public readonly value: T;
	public readonly position: number;
	public readonly level: number;

	constructor(
		public readonly parent: ApplicationArguments,
		public readonly positional_base_index: number,
		private readonly parameter: Parameter,
	) {
		const def = this.parameter.definition as IParamDefineCommand;

		const token = parameter.tokens[0] as ValueToken;
		this.value = token.value as T;
		this.position = parent.arguments.indexOf(token);
		this.level = def.level;
	}

	single(name: IParamDefineFlag): string | undefined {
		return this.parent.single(name);
	}
	multiple(name: IParamDefineFlag): string[] {
		return this.parent.multiple(name);
	}
	at(index: number): string | undefined {
		return this.parent.at(this.positional_base_index + index);
	}
	range(index: number, maxCount?: number): string[] {
		return this.parent.range(this.positional_base_index + index, maxCount);
	}
	flag(name: IParamDefineFlag): number {
		return this.parent.flag(name);
	}
	command<T extends string>(commands: readonly T[]): ISubArgsReaderApi<T> | undefined {
		const desc = normalizeParameterDescription({ commands, level: this.level + 1 });
		const parameter = this.parent.parameters.singleton(desc);

		const args = this.parent._arg_positional(this.position + 1);

		let first_available: ValueToken | undefined;
		for (const arg of args) {
			const used = arg.getBinding();
			if (!used || used.kind === ParamKind.sub_command) {
				first_available = arg;
				break;
			}
		}
		if (!first_available) {
			return undefined;
		}

		if (!commands.includes(first_available.value as any)) {
			throw new UnexpectedCommand(first_available, commands);
		}

		const base = args.indexOf(first_available);
		parameter.bindArgType(ParamKind.sub_command, [first_available]);
		return new CommandArguments(this.parent, this.positional_base_index + base + 1, parameter);
	}

	[customInspectSymbol](depth: number, inspectOptions: InspectOptionsStylized, inspect: typeof node_inspect) {
		const name = inspectOptions.stylize(`[${this.constructor.name}]`, 'special');
		const options = Object.assign({}, inspectOptions, {
			depth: inspectOptions.depth ? inspectOptions.depth - 1 : null,
		});

		if (depth < 0) return name;

		const def = this.parameter.definition as IParamDefineCommand;
		const pobject = {
			level: def.level,
			commands: def.commands.join(', '),
			token0: this.parameter.tokens,
			position: this.position,
			base_index: this.positional_base_index,
			value: this.value,
		};
		const text = `${name} ${inspect(pobject, options)}${wrapStyle(options.colors, '2', ` <-- ${this.constructor.name}`, '0')}`;
		return text;
	}
}
