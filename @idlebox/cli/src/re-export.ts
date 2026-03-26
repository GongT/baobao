import { mapSourcePosition } from '@idlebox/source-map-support';

export { ArgumentError, createArgsReader, type IArgsReaderApi } from '@idlebox/args';

export { argv } from '@idlebox/args/default';

export {
	CliApplicationHelp,
	CommandDefine,
	type IArgDefine,
	type IArgDefineMap,
	type ICommandDefine,
	type ICommandDefineWithCommand,
} from '@idlebox/cli-help-builder';

export {
	createDebug,
	createLogger,
	EnableLogLevel,
	logger,
	type IDebugCommand,
	type IMyDebug,
	type IMyDebugWithControl,
	type IMyLogger,
} from '@idlebox/logger';

export { terminal } from '@idlebox/terminal-control/default';

export function mapSourceFile(file: string): string {
	return mapSourcePosition({ source: file, column: 0, line: 1 }).source;
}
