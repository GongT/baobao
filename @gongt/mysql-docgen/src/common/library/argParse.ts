import { die } from './base';

export interface IParam {
	short?: string;
	param?: boolean;
	missing?(): string | undefined;
	parse?(v: string): any;
}
interface IParamInternal extends IParam {
	long: string;
}

export async function argParse<T extends keyof any>(argv: string[], flags: Record<T, IParam>): Promise<Record<T, any>> {
	const opts: Record<T, any> = {} as any;
	for (const [long, flag] of Object.entries(flags) as [T, IParamInternal][]) {
		flag.long = long as string;

		opts[long] = await singleOpt(argv, flag);
	}
	return opts;
}

function singleOpt(argv: string[], flag: IParamInternal) {
	let v: string | undefined | boolean;

	const i = argv.findIndex((item) => item.startsWith('--' + flag.long + '=') || item === '--' + flag.long);
	if (i !== -1) {
		const c = argv.splice(i, 1)[0];
		if (c.includes('=')) {
			v = c.split('=')[1];
		} else if (flag.param && !(argv[i] + '').startsWith('-')) {
			v = argv.splice(i, 1)[0];
		} else {
			v = true;
		}
		return doParse(v, flag);
	}

	if (v === undefined && flag.short) {
		const i = argv.findIndex((s) => s.startsWith('-' + flag.short));
		if (i !== -1) {
			let p = argv.splice(i, 1)[0].slice(2);
			if (!p && flag.param && !(argv[i] + '').startsWith('-')) {
				p = argv.splice(i, 1)[0];
			}
			return doParse(p || true, flag);
		}
	}

	return doParse(undefined, flag);
}

function doParse(v: string | undefined | boolean, { short, long, param, missing, parse }: IParamInternal) {
	if (v === undefined) {
		if (missing) {
			v = missing();
		} else if (param) {
			die('Missing value of "-%s|--%s"', short, long);
		} else {
			v = 'yes';
		}
	}
	if (v === undefined) {
		return undefined;
	}
	if (parse) {
		return parse(v as string);
	} else {
		return v === 'yes' ? true : v;
	}
}
