import { ProjectConfig } from '@build-script/rushstack-config-loader';
import { logger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectRoot, selfRoot } from './paths.js';

interface IPackageBinary {
	package: string;
	binary?: string;
	arguments?: readonly string[];
}

interface ICommandInput {
	title?: string;
	command: string | readonly string[] | IPackageBinary;
	watch?: string | readonly string[] | boolean;
	cwd?: string;
	env?: Record<string, string>;
}
interface IConfigFileInput {
	build: (string | ICommandInput)[];
	commands: Record<string, ICommandInput>;
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
	additionalPaths: readonly string[];
}

function watchModeCmd(
	command: string | readonly string[],
	watch?: string | readonly string[] | boolean,
	watchMode?: boolean,
): string | readonly string[] {
	if (!watchMode) {
		return command;
	}
	if (typeof watch === 'boolean') {
		throw new Error(`Invalid watch value: ${watch}. Expected string or array.`);
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
	const config = new ProjectConfig(projectRoot, undefined, logger);
	const schemaFile = resolve(selfRoot, 'commands.schema.json');

	const configFile = config.getJsonConfigInfo('commands');
	logger.debug`using config file long<${configFile.effective}>`;

	const input: IConfigFileInput = config.loadBothJson('commands', schemaFile, {
		array(left, right, keyPath) {
			switch (keyPath[0]) {
				case 'build':
				case 'clean': {
					if (!Array.isArray(right)) {
						return left;
					}
					const s = new Set([...left, ...right]);
					return [...s.values()];
				}
				default:
					return right;
			}
		},
	});

	const buildMap = new Map<string, ICommand>();
	const buildTitles: string[] = [];
	function set(cmd: ICommand) {
		if (buildMap.has(cmd.title)) {
			throw new Error(`duplicate command "${cmd.title}", rename it before continue`);
		}
		buildMap.set(cmd.title, cmd);
		buildTitles.push(cmd.title);
	}

	for (let item of input.build) {
		if (typeof item === 'string') {
			const found = input.commands[item];
			if (!found) {
				logger.fatal`command ${input.build.indexOf(item)} "${item}" not found in "commands" list<${Object.keys(input.commands)}>`;
			}
			item = found;
		}

		if (item.watch === false && watchMode) {
			let debug_title = item.title;
			if (!debug_title) {
				if (Array.isArray(item.command)) {
					debug_title = item.command[0];
				} else if (typeof item.command === 'string') {
					debug_title = item.command;
				} else if (typeof item.command === 'object' && 'package' in item.command) {
					debug_title = item.command.package;
				}
			}
			logger.log`command "${debug_title}" watch mode is disabled.`;
			continue;
		}

		const cmd = item.command;
		if (Array.isArray(cmd)) {
			const copy = cmd.slice();
			resolveCommandIsFile(config, copy);
			set({
				title: item.title ?? guessTitle(cmd),
				command: watchModeCmd(copy, item.watch, watchMode),
				cwd: resolve(projectRoot, item.cwd || '.'),
				env: item.env ?? {},
			});
		} else if (typeof cmd === 'object' && 'package' in cmd) {
			const obj = parsePackagedBinary(config, item, watchMode);
			set(obj);
		} else {
			throw TypeError(`Invalid command type: ${typeof cmd}. Expected string or array or object.`);
		}
	}

	const additionalPaths: string[] = [];
	if (config.rigConfig.rigFound) {
		const nmPath = findUpUntilSync({ file: 'node_modules', from: config.rigConfig.getResolvedProfileFolder() });
		if (!nmPath) {
			throw new Error(
				`Failed to find "node_modules" folder in rig profile "${config.rigConfig.getResolvedProfileFolder()}".`,
			);
		}
		additionalPaths.push(resolve(nmPath, '.bin'));
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
		additionalPaths: additionalPaths.toReversed(),
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

function parsePackagedBinary(config: ProjectConfig, item: ICommandInput, watchMode: boolean): ICommand {
	const cmd = item.command as IPackageBinary;

	const pkgJsonPath = fileURLToPath(config.resolve(`${cmd.package}/package.json`));
	let title = item.title;
	if (!title) {
		title = cmd.package.split('/').pop();
		if (cmd.binary && cmd.binary !== title) {
			title += `:${cmd.binary}`;
		}
	}

	const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
	const type1 = typeof pkg.bin === 'string';
	const type2 = !!cmd.binary;
	if (type1 && type2) {
		throw new Error(`"${pkgJsonPath}" "bin" field is string, can not specify "binary" in "commands.json".`);
	} else if (!type1 && !type2) {
		throw new Error(`"${pkgJsonPath}" "bin" field is not string, must specify "binary" in "commands.json".`);
	}

	const binVal = type1 ? pkg.bin : pkg.bin[cmd.binary as string];
	const binPath = resolve(pkgJsonPath, '..', binVal);

	return {
		title: title!,
		command: watchModeCmd([process.execPath, binPath, ...(cmd.arguments ?? [])], item.watch, watchMode),
		cwd: resolve(projectRoot, item.cwd || '.'),
		env: item.env ?? {},
	};
}

/**
 * 如果command第一个元素看似是一个文件，则解析成绝对路径并添加node前缀。
 * 直接修改command数组。
 *
 * @param config
 * @param command
 */
function resolveCommandIsFile(config: ProjectConfig, command: string[]) {
	if (!command[0].endsWith('.ts')) return;

	const r = config.getFileInfo(command[0]);

	if (!r.effective) {
		return; // will error later
	}

	command.splice(0, 1, process.execPath, r.effective);
}
