import { c } from './format.js';

export interface ICommandDefine {
	/**
	 * 多行详细帮助信息
	 */
	readonly help: string;
	/**
	 * 紧接在命令后面的参数
	 */
	readonly usage: string;
	/**
	 * usage后面的简短说明
	 */
	readonly description: string;
	/**
	 * 独特命令行参数
	 */
	readonly args: Readonly<IArgDefineMap>;
	/**
	 * 通用命令行参数
	 */
	readonly commonArgs?: Readonly<IArgDefineMap>;
	/**
	 * 是否有位置参数（默认false）
	 */
	readonly positional?: boolean;
	/**
	 * xxx --help 时隐藏
	 */
	readonly isHidden?: boolean;
}

export interface ICommandDefineWithCommand extends ICommandDefine {
	readonly command: string;
}

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

export type IArgDefine = {
	/**
	 * 为false时在后面加一个 <value>
	 */
	readonly flag: boolean;
	readonly description: string;

	readonly isHidden?: boolean;
	/**
	 * 为true时添加到usage最前面
	 */
	readonly usage?: boolean;
};

export type IArgDefineMap = Record<`-${string}`, IArgDefine>;
