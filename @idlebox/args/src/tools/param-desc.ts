import type { IParamDefineCommand, IParamDefineFlag, IParamDefinePosition, IParameterDefinition } from '../types.js';
import { flagReg } from './tokenize.js';

export type IParamDescFlag = {
	// flags 是带 - 的
	flags: string[];
	single: boolean;
	id: string;
};
export type IParamDescRange = {
	from: number;
	to: number;
	id: string;
};
export type IParamDescCmd = {
	cmd: readonly string[];
	level: number;
	id: string;
};
export type IParamDesc = IParamDescFlag | IParamDescRange | IParamDescCmd;

function isNumberArray(definition: IParameterDefinition): definition is IParamDefinePosition {
	return Array.isArray(definition) && typeof definition[0] === 'number';
}

function isCommandDefine(definition: IParameterDefinition): definition is IParamDefineCommand {
	return typeof definition === 'object' && 'level' in definition && 'commands' in definition;
}

export function normalizeParameterDescriptionRange(definition: IParameterDefinition): IParamDescRange {
	const r = normalizeParameterDescription(definition);
	if (!isRange(r)) {
		throw new TypeError(`expected range, but got: ${r.id}`);
	}
	return r;
}
export function normalizeParameterDescriptionFlag(definition: IParameterDefinition): IParamDescFlag {
	const r = normalizeParameterDescription(definition);
	if (!isFlags(r)) {
		throw new TypeError(`expected flags, but got: ${r.id}`);
	}
	return r;
}

export function normalizeParameterDescription(definition: IParamDefineCommand): IParamDescCmd;
export function normalizeParameterDescription(definition: IParamDefinePosition): IParamDescRange;
export function normalizeParameterDescription(definition: IParamDefineFlag): IParamDescFlag;
export function normalizeParameterDescription(definition: IParameterDefinition): IParamDesc;
export function normalizeParameterDescription(definition: IParameterDefinition): IParamDesc {
	if (isCommandDefine(definition)) {
		if (definition.commands.length === 0 || definition.level < 1) {
			throw new TypeError(`command definition must have at least one command and level must be >= 1`);
		}
		return {
			cmd: definition.commands,
			level: definition.level,
			id: `command<${definition.level}:${definition.commands.join('|\u200B')}>`,
		} satisfies IParamDescCmd;
	}

	if (!definition.length) {
		throw new TypeError('parameter definition must not be empty');
	}
	if (typeof definition === 'string') {
		test(definition);
		return { flags: [definition], single: true, id: `flag<${definition}>` } satisfies IParamDescFlag;
	} else if (isNumberArray(definition)) {
		const [from, count] = definition;
		if (from < 0) {
			throw new TypeError(`range start must not be negative: ${from}`);
		}
		const to = from + (count ?? Infinity);
		return { from, to, id: `range<${from}:${Number.isFinite(to) ? to : '∞'}>` } satisfies IParamDescRange;
	} else {
		for (const flag of definition) {
			test(flag);
		}
		return {
			flags: definition.slice(),
			single: false,
			id: `flags<${definition.join('|\u200B')}>`,
		} satisfies IParamDescFlag;
	}
}
function test(flag: string) {
	if (flag[0] !== '-') {
		throw new TypeError(`flag name must start with '-': ${flag}`);
	}
	if (flag[1] === '-') {
		if (flag.length < 3) {
			throw new TypeError(`long flag name must not empty: ${flag}`);
		}
		if (flag.includes('=')) {
			throw new TypeError(`flag name must not have =: ${flag}`);
		}
	} else if (flag.length !== 2) {
		throw new TypeError(`short flag must be two characters: ${flag}`);
	}

	const m = flagReg.exec(flag);
	if (!m) {
		throw new TypeError(`flag is invalid: ${flag}`);
	}
	return flag;
}

export function isFlags(name: IParamDesc): name is IParamDescFlag {
	return 'flags' in name;
}
export function isRange(name: IParamDesc): name is IParamDescRange {
	return 'from' in name;
}
export function isCmd(name: IParamDesc): name is IParamDescCmd {
	return 'cmd' in name;
}
