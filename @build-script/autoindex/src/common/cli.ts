import { createArgsReader } from '@idlebox/args';
import { EnableLogLevel, logger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';
import { resolve } from 'node:path';

export function printUsage() {
	console.log(
		`Usage: autoindex [options] <tsconfig.json>
Options:
  -w, --watch            监视模式
  -d, --debug            显示调试输出
  -C, --config           读取 config/autoindex.json 配置文件
                         如果设置了该选项，但是配置文件不存在，则直接退出，什么也不做
  -o, --output <file>    输出文件路径(默认: autoindex.generated，相对于tsconfig.json所在目录)
  --exclude <pattern>    额外排除的文件或目录
  --include <pattern>    额外包含的文件或目录
  -a, --absolute <path>  绝对导入路径前缀
  --skip-tag <tag>       忽略被 @tag 注释的符号
  --no-config            忽略 "config/autoindex.json" 文件
  -h, --help             显示帮助信息
`.trim(),
	);
}

export enum ConfigKind {
	DISABLE = 'disable',
	IMPLICIT = 'implicit',
	EXPLICIT = 'explicit',
}

export interface ICliArgs {
	readonly configType: ConfigKind;
	readonly watchMode: boolean;
	readonly debugMode: boolean;
	readonly outputFile?: string;
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

		throw logger.fatal(e.message);
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
	const projVal = argv.range(0, 1)[0];

	let configType = ConfigKind.IMPLICIT;
	if (argv.flag(['--config']) > 0) {
		configType = ConfigKind.EXPLICIT;
	} else if (argv.flag(['--config']) < 0) {
		configType = ConfigKind.DISABLE;
	}

	if (verboseMode) {
		logger.enable(EnableLogLevel.verbose);
	} else if (debugMode) {
		logger.enable(EnableLogLevel.debug);
	}

	if (argv.unused().length) {
		logger.fatal`未知的命令行参数: ${argv.unused().join(', ')}`;
	}

	if (absoluteImport && absoluteImport[0] !== '#') {
		throw logger.fatal(`绝对导入路径必须以'#'开头: ${absoluteImport}`);
	}

	if (stripTags.length === 0) {
		stripTags.push('internal');
	}

	const project = projVal ? resolve(process.cwd(), projVal) : undefined;

	return {
		configType,
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
