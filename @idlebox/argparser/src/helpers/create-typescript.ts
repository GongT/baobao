import { camelCase, ucfirst } from '@idlebox/common';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { ArgumentCommand, ArgumentOption, OptionKind } from '../main';

export function createTypescript(cmd: ArgumentCommand, writeToDir: string) {
	let data = `// @ts-ignore
/** GENERATED FILE, DO NOT EDIT */

import {ICommand} from "@idlebox/argparser";
`;
	const ifFile = 'interfaces.ts';
	const commands = collect(cmd);
	for (const cmd of commands) {
		data += createCommandOptions(cmd);
	}

	data += createCommandTree(cmd, []);

	writeFileSync(resolve(writeToDir, ifFile), data);
}

function createCommandTree(cmd: ArgumentCommand, _paths: string[]) {
	let r = '';
	const clsName = nameOf(cmd.name) + 'Command';
	const nameStr = JSON.stringify(cmd.name);

	let next = [],
		quest;
	if (cmd.commands.size === 0) {
		quest = false;
		next.push('undefined');
	}

	r += `export function is${clsName}(cmd: ICommand): cmd is I${clsName} {
	return cmd.command.name === ${nameStr};
}

export interface I${clsName} extends ICommand{
	command: ArgumentCommand & {name: ${nameStr}};
	next${quest ? '?' : ''}: ${next};
	options: ${nameOfOption(cmd)};
}
`;
}

function createCommandOptions(cmd: ArgumentCommand) {
	let r = '';
	r += `export interface ${nameOfOption(cmd)} {\n`;
	for (const item of cmd.options) {
		r += `\t\t${item.fieldName}: ${tsType(item)};`;
	}
	r += '}\n';

	return r;
}

function nameOf(s: string) {
	return ucfirst(camelCase(s));
}
function nameOfOption(c: ArgumentCommand) {
	return `I${nameOf(c.name)}Options`;
}

function eType(item: ArgumentOption) {
	switch (item.type) {
		case OptionKind.String:
		case OptionKind.File:
			return 'string';
		case OptionKind.Int:
		case OptionKind.Float:
			return 'number';
		case OptionKind.BigInt:
			return 'bigint';
		case OptionKind.Boolean:
			return 'boolean';
	}
}
function tsType(item: ArgumentOption) {
	const e = eType(item);
	if (item.isArray) {
		return `${e}[]`;
	} else {
		return e;
	}
}
function collect(cmd: ArgumentCommand, commands = new Set<ArgumentCommand>()) {
	commands.add(cmd);
	for (const c of cmd.commands) {
		collect(c, commands);
	}

	return commands;
}
