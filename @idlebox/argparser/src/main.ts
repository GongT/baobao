import { camelCase, lcfirst } from '@idlebox/common';
import { verifyLong, verifyShort } from './helpers/verify';

export class ArgumentCommand {
	public readonly commands = new Set<ArgumentCommand>();
	public readonly options = new Set<ArgumentOption>();
	public description?: string;
	public subCommandRequired = true;
	public allowExtraOptions = true;

	constructor(
		public readonly name: string,
		public readonly help: string,
		public readonly parent: string = process.argv0,
	) {}

	sub(name: string, help: string) {
		const cmd = new ArgumentCommand(name, help, [this.parent, this.name].filter((e) => e).join(' '));
		this.commands.add(cmd);
		return cmd;
	}

	opt(type: OptionKind, vd: string | [string, string], help: string) {
		const opt = new ArgumentOption(type, vd, help);
		this.options.add(opt);
		return opt;
	}
}

export enum OptionKind {
	String,
	Int,
	BigInt,
	Float,
	File,
	Boolean,
}

export class ArgumentOption {
	private readonly names: [string, string?];
	public description?: string;
	public enums?: string[];
	public defaults: any;
	public required: boolean = false;
	public readonly helpVar: string;
	public isArray: boolean = false;

	public fieldName: string;

	public get short() {
		return this.names[1];
	}
	public get long() {
		return this.names[0];
	}

	constructor(
		public readonly type: OptionKind,
		public varDefine: string | [string, string],
		public readonly help: string,
	) {
		if (typeof varDefine === 'string') {
			verifyLong(varDefine);
			this.names = [varDefine];
		} else {
			if (varDefine[0]?.length < 2) throw new Error('Option must have long name: ' + varDefine[0]);
			verifyLong(varDefine[0]);
			if (varDefine[1] !== undefined) verifyShort(varDefine[1]);
			this.names = varDefine;
		}
		this.fieldName = lcfirst(camelCase(this.names[0]));

		let r = '--' + this.long;
		if (this.type !== OptionKind.Boolean) {
			r += '=';
		}
		if (this.short) {
			r += ',-' + this.short;
		}

		this.helpVar = r;
	}
}
