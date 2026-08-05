import type { IArgsReaderApi, ISubArgsReaderApi } from '@idlebox/args';
import { argv } from '@idlebox/args/default';
import { CliApplicationHelp, type CommandDefine, type IArgDefineMap, type ICommandDefine, type ICommandDefineWithCommand } from '@idlebox/cli-help-builder';
import {
	DuplicateCallError,
	ExitCode,
	humanDate,
	NotImplementedError,
	registerGlobalLifecycle,
	SoftwareDefectError,
	toDisposable,
	UsageError,
	type IPackageJson,
} from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { registerNodejsExitHandler, shutdown } from '@idlebox/node';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { findPackageJSON, getSourceMapsSupport } from 'node:module';
import { basename, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getCallSites } from 'node:util';
import type { IApp } from './index.js';
import { mapSourceFile } from './source-map.js';

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
			throw new Error('子命令未知或不存在');
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
		throw new Error(`无法确定"${mainUri}"的 package.json`);
	}
	let { name, description } = JSON.parse(readFileSync(pkgPath, 'utf-8')) as IPackageJson;

	if (name.startsWith('@')) {
		name = basename(name);
	}

	return { name, description };
}

interface IApplicationHelper {
	help(): string;
	legend(): string;
	usage(): string;
}

type InitFunc = (argv: IArgsReaderApi, command?: ISubArgsReaderApi) => void | Promise<void>;
interface IApplicationEntry {
	getHelper(command?: string): Promise<IApplicationHelper>;
	withCommon(commonArgs: IArgDefineMap): this;
	simple(command: Omit<ICommandDefine, 'description' | 'commonArgs' | 'isHidden'>, main: (args: IArgsReaderApi) => Promise<void>): Promise<void>;
	static(imports: Record<string, string>, helps: readonly ICommandDefineWithCommand[]): Promise<void>;
	dynamic(absRootDir: string, globs?: string | string[]): Promise<void>;
	initialize(callback: InitFunc): this;
}

export function makeApplication({ name: binName, description, logPrefix }: IAppBasic = autoload()): IApplicationEntry {
	assert.equal(typeof binName, 'string', 'makeApplication: name参数必须是字符串');
	assert.equal(typeof description, 'string', 'makeApplication: description参数必须是字符串');

	if (info.initialized) {
		throw new DuplicateCallError(makeApplication);
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

	logger.verbose`source map is: ${getSourceMapsSupport().enabled}`;

	if (!binName || !description) {
		throw new SoftwareDefectError(`缺少应用程序名称或描述，请在 package.json 中正确设置 name 和 description 字段，或者在调用 makeApplication() 时手动传入`);
	}

	const coreLog = logger.extend('nodejs');
	registerNodejsExitHandler(coreLog);

	if (logger.debug.isEnabled) {
		const startTime = Date.now();
		registerGlobalLifecycle(
			toDisposable(() => {
				logger.debug(`进程即将退出，状态码=${process.exitCode} | ${humanDate.delta(startTime, Date.now())}`);
			}),
		);
	}

	if (info.debug && info.silent) {
		throw new UsageError(`不能同时使用 --debug 和 --silent`);
	}

	let commons: IArgDefineMap | undefined;
	let commands: readonly ICommandDefineWithCommand[];
	const initializeCallbacks: Array<InitFunc> = [];
	async function initializeIfNeeded(command?: ISubArgsReaderApi) {
		const list = initializeCallbacks.slice();
		initializeCallbacks.length = 0;
		Object.freeze(initializeCallbacks);

		for (const cb of list) {
			await cb(argv, command);
		}
	}

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
				assert.ok(cmd, `无效的命令: ${command}`);
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
			if (commons) throw new Error(`重复注册通用参数`);
			commons = commonArgs;
			return this;
		},
		initialize(cb) {
			initializeCallbacks.push(cb);
			return this;
		},
		async simple(command: Omit<ICommandDefine, 'description' | 'commonArgs' | 'isHidden'>, main: (args: IArgsReaderApi) => Promise<void>) {
			if (info.showHelp) {
				const help = await this.getHelper();
				console.error(help.help());
				shutdown(0);
			}

			consumeCommandArguments(command);

			await initializeIfNeeded();
			const result = await main(argv);

			if (result !== undefined) {
				logger.warn`主函数返回值类型不是void`;
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
				logger.error(`缺少命令，使用 --help/-h 查看可用命令`);
				shutdown(ExitCode.USAGE);
			}
			const commandName = subcmd.value;

			assert.ok(imports[commandName], `命令"${commandName}"不存在`);

			const callSites = getCallSites(2, { sourceMap: false });
			const entryFile = new URL(imports[commandName], callSites[1].scriptName).toString();

			if (commons) consumeArguments(commons);
			consumeCommandArguments(commands.find((cmd) => cmd.command === commandName));

			await initializeIfNeeded(subcmd);
			await execMain(entryFile, subcmd);
		},
		async dynamic(absRootDir: string, globs: string | string[] = ['*.js']) {
			if (typeof globs === 'string') {
				globs = [globs];
			}
			logger.verbose`动态命令模式\n\troot: ${absRootDir}\n\tglobs: ${globs.join(', ')}`;

			const known_commands: string[] = [];
			const importMap: Record<string, string> = {};
			for await (const fname of glob(globs, { cwd: absRootDir })) {
				const base = basename(fname, extname(fname));
				const path = resolve(absRootDir, fname);

				known_commands.push(base);
				importMap[base] = path;
			}

			if (known_commands.length === 0) {
				logger.error`在relative<${absRootDir}>下未找到任何命令文件，匹配模式: "${globs.join('", "')}"`;
				shutdown(ExitCode.PROGRAM);
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
				logger.error(`缺少命令，使用 --help/-h 查看可用命令`);
				shutdown(ExitCode.USAGE);
			}
			const commandName = subcmd.value;

			if (commons) consumeArguments(commons);
			consumeCommandArguments(commands.find((cmd) => cmd.command === commandName));

			await initializeIfNeeded(subcmd);
			await execMain(importMap[commandName], subcmd);
		},
	};
}

async function execMain(file: string, subcmd: ISubArgsReaderApi) {
	const path = file.startsWith('file:') ? file : pathToFileURL(file).href;
	const { main } = await import(path);

	logger.verbose`执行js文件: ${mapSourceFile(file)}`;

	if (typeof main !== 'function') {
		throw new NotImplementedError(`文件${mapSourceFile(file)}中缺少main()函数`);
	}

	const result = await main(subcmd);

	if (result !== undefined) {
		logger.warn`主函数返回值类型不是void，文件: long<${mapSourceFile(file)}>`;
	}
}

async function importDefine(file: string): Promise<ICommandDefineWithCommand> {
	const path = file.startsWith('file:') ? file : pathToFileURL(file).href;
	const { Command } = await import(path);

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
