import type { IArgsReaderApi, ISubArgsReaderApi } from '@idlebox/args';
import { argv } from '@idlebox/args/default';
import { CliApplicationHelp, type CommandDefine, type IArgDefineMap, type ICommandDefine, type ICommandDefineWithCommand } from '@idlebox/cli-help-builder';
import { humanDate, NotImplementedError, registerGlobalLifecycle, SoftwareDefectError, toDisposable, UsageError, type IPackageJson } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { registerNodejsExitHandler, shutdown } from '@idlebox/node';
import { hasInstalledSourceMapSupport } from '@idlebox/source-map-support';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { findPackageJSON } from 'node:module';
import { basename, extname, resolve } from 'node:path';
import { getCallSites } from 'node:util';
import { mapSourceFile, type IApp } from './index.js';

class CliApplication implements IApp {
	public debug = false;
	public verbose = false;
	public silent = false;
	public showHelp = false;
	public color = false;
	public initialized = false;

	private _command = '';
	get command() {
		if (!this._command) {
			throw new Error('application sub command is unknown or not exists');
		}
		return this._command;
	}
}

const info = new CliApplication();
export const app: Readonly<IApp> = info;

const fixedCommon = {
	'--debug, -d': { flag: true, description: '增加输出（最多2个）' },
	'--quiet, -s, --silent': { flag: true, description: '减少输出' },
	'--help, -h': { flag: true, description: '显示帮助信息' },
};

interface IAppBasic {
	readonly name: string;
	readonly description: string;
	readonly logPrefix?: string;
}

function autoload(): IAppBasic {
	const callSites = getCallSites(3, { sourceMap: false });
	const mainUri = callSites[2].scriptName;
	const pkgPath = findPackageJSON(mainUri);

	if (!pkgPath) {
		throw new Error(`can not determin package.json for ${mainUri}`);
	}
	let { name, description } = JSON.parse(readFileSync(pkgPath, 'utf-8')) as IPackageJson;

	if (name.startsWith('@')) {
		name = basename(name);
	}

	return { name, description };
}

export function makeApplication({ name: binName, description, logPrefix }: IAppBasic = autoload()) {
	assert.equal(typeof binName, 'string', 'name must be a string');
	assert.equal(typeof description, 'string', 'description must be a string');

	if (info.initialized) {
		throw new Error(`duplicate call to makeApplication`);
	}
	info.initialized = true;

	process.title = binName;

	const debugLvl = argv.flag(['--debug', '-d']);
	const silent = argv.flag(['--silent', '-s', '--quiet']) > 0;

	info.showHelp = argv.flag(['--help', '-h']) > 0;
	info.verbose = debugLvl > 1;
	info.debug = debugLvl > 0;
	info.silent = silent;

	let level = EnableLogLevel.auto;
	if (info.verbose) {
		level = EnableLogLevel.verbose;
	} else if (info.debug) {
		level = EnableLogLevel.debug;
	} else if (info.silent) {
		level = EnableLogLevel.error;
	}

	createRootLogger(logPrefix ?? binName, level);
	info.color = logger.colorEnabled;

	logger.verbose`source-map-support is: ${hasInstalledSourceMapSupport()}`;

	if (!binName || !description) {
		throw new SoftwareDefectError(`missing application name or description`);
	}

	const coreLog = logger.extend('nodejs');
	registerNodejsExitHandler({
		output: coreLog.log,
		verbose: coreLog.verbose,
	});

	if (logger.debug.isEnabled) {
		const startTime = Date.now();
		registerGlobalLifecycle(
			toDisposable(() => {
				logger.debug(`process will exit with code ${process.exitCode} | ${humanDate.delta(startTime, Date.now())}`);
			}),
		);
	}

	if (info.debug && info.silent) {
		throw new UsageError(`can not use --debug and --silent together`);
	}

	let commons: IArgDefineMap | undefined;
	let commands: readonly ICommandDefineWithCommand[];

	return {
		async getHelper(command?: string) {
			const help = new CliApplicationHelp(binName, description);

			if (!info.color) {
				help.disableColor();
			}

			if (commons) {
				help.registerCommonArgs(commons);
			}
			help.registerCommonArgs(fixedCommon);

			if (command) {
				const cmd = commands.find((item) => item.command === command);
				assert.ok(cmd, `invalid command: ${command}`);
				help.registerCommand(command, cmd);
			} else {
				for (const cmd of commands) {
					if (cmd.isHidden) {
						continue;
					}
					help.registerCommand(cmd.command, cmd);
				}
			}

			return {
				help() {
					return help.help(command);
				},
				legend() {
					return help.legend();
				},
				usage() {
					return help.usage(command);
				},
			};
		},
		withCommon(commonArgs: IArgDefineMap) {
			if (commons) throw new Error(`duplicate register common arguments`);
			commons = commonArgs;
			return this;
		},
		async simple(command: Omit<ICommandDefine, 'description' | 'commonArgs' | 'isHidden'>, main: (args: IArgsReaderApi) => Promise<void>) {
			if (info.showHelp) {
				const help = await this.getHelper();
				console.error(help.help());
				shutdown(0);
			}

			consumeCommandArguments(command);

			const result = await main(argv);

			if (result !== undefined) {
				logger.warn`main function retrun type is not void`;
			}
		},
		async static(imports: Record<string, string>, helps: readonly ICommandDefineWithCommand[]) {
			commands = helps;

			const known_commands = Array.from(Object.keys(imports));
			const subcmd = argv.command(known_commands);

			if (info.showHelp) {
				const help = await this.getHelper(subcmd?.value);
				console.error(help.help());
				shutdown(0);
			}
			if (!subcmd?.value) {
				throw new UsageError(`missing command, use --help/-h to see available commands`);
			}
			const commandName = subcmd.value;

			assert.ok(imports[commandName], `command "${commandName}" not found`);

			const callSites = getCallSites(2, { sourceMap: false });
			const entryFile = new URL(imports[commandName], callSites[1].scriptName).toString();

			if (commons) consumeArguments(commons);
			consumeCommandArguments(commands.find((cmd) => cmd.command === commandName));

			await execMain(entryFile, subcmd);
		},
		async dynamic(absRootDir: string, globs: string | string[] = ['*.js']) {
			if (typeof globs === 'string') {
				globs = [globs];
			}
			logger.verbose`dynamic command\n\troot: ${absRootDir}\n\tglobs: ${globs.join(', ')}`;

			const known_commands: string[] = [];
			const importMap: Record<string, string> = {};
			for await (const fname of glob(globs, { cwd: absRootDir })) {
				const base = basename(fname, extname(fname));
				const path = resolve(absRootDir, fname);

				known_commands.push(base);
				importMap[base] = path;
			}

			const subcmd = argv.command(known_commands);

			if (subcmd?.value) {
				const cmd = await importDefine(importMap[subcmd.value]);
				commands = [cmd];
			} else {
				commands = await Promise.all(known_commands.map((cmd) => importDefine(importMap[cmd])));
			}

			if (info.showHelp) {
				const help = await this.getHelper(subcmd?.value);
				console.error(help.help());
				shutdown(0);
			}

			if (!subcmd?.value) {
				throw new UsageError(`missing command, use --help/-h to see available commands`);
			}
			const commandName = subcmd.value;

			if (commons) consumeArguments(commons);
			consumeCommandArguments(commands.find((cmd) => cmd.command === commandName));

			await execMain(importMap[commandName], subcmd);
		},
	};
}

async function execMain(file: string, subcmd: ISubArgsReaderApi) {
	logger.verbose`executing js file: ${mapSourceFile(file)}`;
	const { main } = await import(file);
	if (typeof main !== 'function') {
		throw new NotImplementedError(`missing main() function in file ${mapSourceFile(file)}`);
	}

	const result = await main(subcmd);

	if (result !== undefined) {
		logger.warn`main function retrun type is not void in file long<${mapSourceFile(file)}>`;
	}
}

async function importDefine(file: string): Promise<ICommandDefineWithCommand> {
	const { Command } = await import(file);

	assert.ok(Command, `file not export Command: ${file}`);

	const cmd: CommandDefine = new Command();
	return {
		command: basename(file, extname(file)),
		...cmd.toJSON(),
	};
}

const spaces = /\s+/g;

function consumeArguments(defines: IArgDefineMap) {
	for (const [name, { flag }] of Object.entries(defines)) {
		const names = name.split(spaces);
		if (flag) {
			argv.flag(names);
		} else {
			argv.multiple(names);
		}
	}
}

function consumeCommandArguments(command?: Pick<ICommandDefine, 'args' | 'commonArgs' | 'positional'>) {
	if (!command) {
		throw new UsageError(`program defect: command must not empty not`);
	}

	if (command.args) consumeArguments(command.args);
	if (command.commonArgs) consumeArguments(command.commonArgs);
	if (!command.positional) {
		if (argv.unused().length > 0) {
			throw new UsageError(`unexpected arguments: ${argv.unused().join(', ')}`);
		}
	}
}
