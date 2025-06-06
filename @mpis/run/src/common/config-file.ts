import { ProjectConfig } from '@build-script/rushstack-config-loader';
import { logger } from '@idlebox/logger';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { projectRoot, selfRoot } from './paths.js';

interface ICommandInput {
	title?: string;
	command: string | readonly string[];
	watch?: string | readonly string[];
	cwd?: string;
	env?: Record<string, string>;
}
interface IConfigFileInput {
	build: string[] | ICommandInput[];
	clean: string[];
}

export interface ICommand {
	title: string;
	command: string | readonly string[];
	cwd: string;
	env: Record<string, string>;
}
export interface IConfigFile {
	buildTitles: readonly string[];
	build: ReadonlyMap<string, ICommand>;
	clean: readonly string[];
}

function watchModeCmd(
	command: string | readonly string[],
	watch?: string | readonly string[],
	watchMode?: boolean,
): string | readonly string[] {
	if (!watchMode) {
		return command;
	}

	if (typeof command === 'string') {
		if (!watch) watch = '-w';

		return `${command} ${watch}`;
	} else {
		if (!watch) watch = ['-w'];

		return [...command, ...watch];
	}
}

export function loadConfigFile(watchMode: boolean): IConfigFile {
	const config = new ProjectConfig(projectRoot, undefined, logger.warn);
	const schema = JSON.parse(readFileSync(resolve(selfRoot, 'commands.schema.json'), 'utf-8'));
	const input: IConfigFileInput = config.loadBothJson('commands', schema);

	const buildMap = new Map<string, ICommand>();
	const buildTitles: string[] = [];
	function set(cmd: ICommand) {
		if (buildMap.has(cmd.title)) {
			throw new Error(`duplicate command "${cmd.title}", rename it before continue`);
		}
		buildMap.set(cmd.title, cmd);
		buildTitles.push(cmd.title);
	}

	for (const item of input.build) {
		if (typeof item === 'string') {
			set({
				title: guessTitle(item),
				command: watchModeCmd(item, undefined, watchMode),
				cwd: projectRoot,
				env: {},
			});
		} else {
			set({
				title: item.title ?? guessTitle(item.command),
				command: watchModeCmd(item.command, item.watch, watchMode),
				cwd: resolve(projectRoot, item.cwd || '.'),
				env: item.env ?? {},
			});
		}
	}

	const clean = [];
	for (const item of input.clean) {
		const abs = resolve(projectRoot, item);
		if (!abs.startsWith(projectRoot)) {
			throw new Error(`invalid clean path "${item}", out of project "${projectRoot}"`);
		}
		clean.push(abs);
	}

	return {
		buildTitles,
		build: buildMap,
		clean,
	};
}

function guessTitle(command: string | readonly string[]): string {
	if (typeof command === 'string') {
		return command.split(' ')[0];
	}
	if (Array.isArray(command)) {
		return command[0];
	}

	throw new Error(`Invalid command: ${Array.isArray(command) ? command.join(' ') : command}.`);
}
