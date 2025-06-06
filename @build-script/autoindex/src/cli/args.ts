import { createArgsReader } from '@idlebox/args';
import { resolve } from 'node:path';
import type { ILogger } from '../common/logger.js';

export function printUsage() {
	console.log(
		`Usage: autoindex [options] <tsconfig.json>
Options:
  -w, --watch            监视模式
  -d, --debug            显示调试输出
  -o, --output <file>    输出文件路径(默认: autoindex.generated，相对于tsconfig.json所在目录)
  --exclude <pattern>    额外排除的文件或目录
  --include <pattern>    额外包含的文件或目录
  -a, --absolute <path>  绝对导入路径前缀
  --skip-tag <tag>       忽略被 @tag 注释的符号
  -h, --help             显示帮助信息
`.trim()
	);
}

export function parseArgs() {
	const argv = createArgsReader(process.argv.slice(2));

	if (argv.flag(['-h', '--help']) > 0) {
		printUsage();
		process.exit(0);
	}

	const watchMode = argv.flag(['-w', '--watch']) > 0;
	const debugMode = argv.flag(['-d', '--debug']) > 0;
	const verboseMode = argv.flag(['-d', '--debug']) > 1;
	const outputFile = argv.single(['-o', '--output']) ?? './autoindex.generated';
	const excludePatterns = argv.multiple(['--exclude']);
	const includePatterns = argv.multiple(['--include']);
	const absoluteImport = argv.single(['-a', '--absolute']);
	const stripTags = argv.multiple(['--skip-tag']);
	const projVal = argv.range(0, 1)[0];

	if (stripTags.length === 0) {
		stripTags.push('internal');
	}

	const project = resolve(process.cwd(), projVal);

	return {
		watchMode,
		debugMode,
		outputFile: `${outputFile}.ts`,
		excludePatterns,
		includePatterns,
		absoluteImport,
		stripTags,
		project,
		verboseMode,
	} as const;
}

export type ICliCtx = ReturnType<typeof parseArgs>;

export function createConsoleLogger(context: ICliCtx): ILogger {
	function debug(msg: string, ...args: any[]) {
		console.debug(`\x1B[2m${msg}\x1B[0m`, ...args);
	}
	return {
		log: console.error.bind(console),
		error(msg: string, ...args: any[]) {
			console.error(`\x1B[38;5;9m${msg}\x1B[0m`, ...args);
		},
		debug: context.debugMode ? debug : () => {},
	};
}
