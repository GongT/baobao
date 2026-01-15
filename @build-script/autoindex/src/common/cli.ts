import { createArgsReader } from '@idlebox/args';
import { ExitCode } from '@idlebox/common';
import { EnableLogLevel, logger } from '@idlebox/logger';
import { findUpUntilSync, shutdown } from '@idlebox/node';
import { isAbsolute, resolve } from 'node:path';

export function printUsage() {
	console.log(
		`Usage: autoindex [options] <tsconfig.json>
Options:
  -w, --watch            监视模式
  -d, --debug            显示调试输出
  -C, --config           读取 config/autoindex.json 配置文件
                         如果没有设置该选项，但配置文件存在，则默认读取配置文件
                         如果设置了该选项，但是配置文件不存在，则直接退出，什么也不做
                         如果设置了两次，但是配置文件不存在，则报告错误
  --no-config            不要默认读取配置文件
  --config-name <name>   读取指定的配置文件而不是“autoindex”（隐含-C）
  -o, --output <file>    输出文件路径(默认: autoindex.generated，相对于tsconfig.json所在目录)
  --exclude <pattern>    额外排除的文件或目录
  --include <pattern>    额外包含的文件或目录
  -a, --absolute <path>  绝对导入路径前缀
  --skip-tag <tag>       忽略被 @tag 注释的符号
  -h, --help             显示帮助信息
`.trim(),
	);
}

export enum ConfigKind {
	DISABLE = 'disable',
	IMPLICIT = 'implicit',
	EXPLICIT = 'explicit',
	REQUIRED = 'required',
}

export interface ICliArgs {
	readonly configType: ConfigKind;
	readonly watchMode: boolean;
	readonly debugMode: boolean;
	readonly outputFile?: string;
	readonly configFile: string;
	readonly excludePatterns: string[];
	readonly includePatterns: string[];
	readonly absoluteImport?: string;
	readonly skipTags: string[];
	readonly project?: string;
	readonly verboseMode: boolean;
}

export async function parseArgs() {
	try {
		return await _parseArgs();
	} catch (e: any) {
		printUsage();

		logger.error(e.message);
		shutdown(1);
	}
}
async function _parseArgs(): Promise<ICliArgs> {
	const argv = createArgsReader(process.argv.slice(2));

	if (argv.flag(['-h', '--help']) > 0) {
		printUsage();
		process.exit(0);
	}

	const watchMode = argv.flag(['-w', '--watch']) > 0;
	const debugMode = argv.flag(['-d', '--debug']) > 0;
	const verboseMode = argv.flag(['-d', '--debug']) > 1;
	const outputFile = argv.single(['-o', '--output']);
	const excludePatterns = argv.multiple(['--exclude']);
	const includePatterns = argv.multiple(['--include']);
	const absoluteImport = argv.single(['-a', '--absolute']);
	const stripTags = argv.multiple(['--skip-tag']);
	const useConfig = argv.flag(['-C', '--config']);
	const configName = argv.single(['--config-name']);

	let configType = ConfigKind.IMPLICIT;
	if (useConfig === 1) {
		configType = ConfigKind.EXPLICIT;
	} else if (useConfig === 2) {
		configType = ConfigKind.REQUIRED;
	} else if (useConfig < 0) {
		configType = ConfigKind.DISABLE;
	}

	if (configName !== undefined) {
		if (configName.startsWith('.') || isAbsolute(configName)) {
			throw new Error('--config-name 只能是一个简单的名称，不能包含路径部分');
		}
		if (configType === ConfigKind.DISABLE) {
			throw new Error('--config-name 不能与 --no-config 一起使用');
		}
	}

	if (verboseMode) {
		logger.enable(EnableLogLevel.verbose);
	} else if (debugMode) {
		logger.enable(EnableLogLevel.debug);
	}

	if (argv.unused().length) {
		logger.error`未知的命令行参数: ${argv.unused().join(', ')}`;
		shutdown(ExitCode.USAGE);
	}

	if (absoluteImport && absoluteImport[0] !== '#') {
		logger.error`绝对导入路径必须以'#'开头: long<${absoluteImport}>`;
		shutdown(ExitCode.USAGE);
	}

	if (stripTags.length === 0) {
		stripTags.push('internal');
	}

	const projVal = argv.range(0, 1)[0];
	const project = projVal ? resolve(process.cwd(), projVal) : undefined;

	return {
		configType,
		configFile: `config/${configName ?? 'autoindex'}.json`,
		watchMode,
		debugMode,
		outputFile,
		excludePatterns,
		includePatterns,
		absoluteImport,
		skipTags: stripTags,
		project,
		verboseMode,
	};
}

export type ICliCtx = ReturnType<typeof parseArgs>;

const _schemaFile = findUpUntilSync({ file: 'autoindex.schema.json', from: import.meta.dirname });
if (!_schemaFile) {
	throw new Error('missing schema file: autoindex.schema.json');
}
export const schemaFile = _schemaFile;
