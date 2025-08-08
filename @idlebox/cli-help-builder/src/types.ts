import { c } from './format.js';

export interface ICommandDefine {
	readonly help: string;
	readonly usage: string;
	readonly description: string;
	readonly args: Readonly<IArgDefineMap>;
	readonly commonArgs: Readonly<IArgDefineMap>;
	readonly isHidden?: boolean;
}

export interface ICommandDefineWithCommand extends ICommandDefine {
	readonly command: string;
}

export abstract class CommandDefine implements ICommandDefine {
	/**
	 * 紧接在命令后面的参数
	 */
	protected abstract readonly _usage: string;
	/**
	 * usage后面的简短说明
	 */
	protected abstract readonly _description: string;
	/**
	 * 多行详细帮助信息
	 */
	protected abstract readonly _help: string;
	/**
	 * 独特命令行参数
	 */
	protected readonly _arguments?: IArgDefineMap;
	/**
	 * 通用命令行参数
	 */
	protected readonly _commonArgs?: IArgDefineMap;

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

export type IArgDefine = {
	/**
	 * 为false时在后面加一个 <value>
	 */
	readonly flag: boolean;
	readonly description: string;

	/**
	 * 为true时添加到usage最前面
	 */
	readonly usage?: boolean;
};

export type IArgDefineMap = Record<`-${string}`, IArgDefine>;
