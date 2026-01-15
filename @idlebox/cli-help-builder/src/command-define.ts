import { c } from './format.js';
import type { IArgDefineMap, ICommandDefine } from './types.js';

export abstract class CommandDefine implements ICommandDefine {
	protected abstract readonly _usage: string;
	protected abstract readonly _description: string;
	protected abstract readonly _help: string;
	protected readonly _arguments?: IArgDefineMap;
	protected readonly _commonArgs?: IArgDefineMap;
	public readonly positional: boolean = false;

	get help() {
		return this._help;
	}

	get usage() {
		let prefix = '';
		if (this._arguments) {
			for (const [key, arg] of Object.entries(this._arguments)) {
				if (arg.usage) {
					prefix += `${c('14;3', key)} `;
				}
			}
		}
		return prefix + this._usage;
	}
	get description() {
		return this._description;
	}
	get args() {
		return this._arguments || {};
	}
	get commonArgs() {
		return this._commonArgs || {};
	}

	toJSON(): ICommandDefine {
		const additional = {} as any;
		for (const key in this) {
			if (key.startsWith('_')) continue;

			additional[key] = this[key];
		}

		return {
			help: this.help,
			usage: this.usage,
			description: this.description,
			args: this.args,
			commonArgs: this.commonArgs,

			...additional,
		};
	}
}
