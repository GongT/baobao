import { assert } from './assert.js';
import type { IArgumentList } from '../types.js';
import type { ApplicationArguments } from '../library/reader.app.js';
import { BothToken, DoubleDashToken, FlagToken, type TToken, ValueToken } from '../library/token.js';

export const flagReg = /^(?:--(?!-)(?<long_flag>[^=]+)|-(?!-)(?<short_flag>[^=-]+))(?:=(?<value>.*))?$/s;

function splitParamsAndExtras(inputs: IArgumentList): [string[], IArgumentList] {
	const doubleDash = inputs.indexOf('--');
	if (doubleDash === -1) {
		return [inputs.slice(), []];
	}

	const params = inputs.slice(0, doubleDash);
	const extras = inputs.slice(doubleDash + 1);
	return [params, extras];
}

function explodeMultipleFlags(params: string[]): void {
	for (const [index, param] of [...params.entries()].toReversed()) {
		const result = flagReg.exec(param);
		if (result?.groups?.short_flag && result.groups.short_flag.length > 1) {
			const flags = result.groups.short_flag.split('');
			if (result.groups.value) {
				flags[flags.length - 1] += `=${result.groups.value}`;
			}
			params.splice(index, 1, ...flags.map((f) => `-${f}`));
		}
	}
}

/**
 * 将字符串数组转换为Token列表
 * @param inputs 命令行参数列表
 * @returns Token列表
 */
export function tokenize(inputs: IArgumentList, parser?: ApplicationArguments): TToken[] {
	const tokens: TToken[] = [];

	const [params, extras] = splitParamsAndExtras(inputs);
	explodeMultipleFlags(params);
	const total = params.length;

	for (const [index, param] of params.entries()) {
		const match = flagReg.exec(param);
		if (match?.groups) {
			if (!match.groups.long_flag === !match.groups.short_flag) {
				// 由于正则匹配逻辑，这是不可能的
				throw new TypeError(`invalid program logic: ${param}`);
			}

			const value: string | undefined = match.groups.value;

			let flag: string;
			const short = !!match.groups.short_flag;

			if (short) {
				flag = match.groups.short_flag;
				assert(flag.length === 1, `short flag must be a single character: ${flag}\noriginal: ${inputs.join(' ')}\nparams:\n  * ${params.join('\n  * ')}\nextras:\n  * ${extras.join('\n  * ')}`);
			} else {
				flag = match.groups.long_flag;
			}

			if (value) {
				tokens.push(new BothToken(parser, { index, total }, { name: flag, short, value }));
			} else {
				tokens.push(new FlagToken(parser, { index, total }, { name: flag, short }));
			}
		} else {
			tokens.push(new ValueToken(parser, { index, total }, { value: param }));
		}
	}
	if (extras.length) {
		tokens.push(new DoubleDashToken(parser, { index: total, total: total }));
		for (const [index, param] of extras.entries()) {
			tokens.push(new ValueToken(parser, { index: total + 1 + index, total: total }, { value: param }));
		}
	}

	return tokens;
}
