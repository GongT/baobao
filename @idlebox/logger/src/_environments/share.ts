import type { ILoggerOptionsReq } from '../common/logger.create.js';
import type { IInstrestedConsole } from '../common/types.js';

export { logTagColor } from '../common/colors.js';
export { createDebug } from '../common/create.function.js';
export {
	debug_enabled,
	is_string_truthy,
	match_disabled,
	match_enabled,
	set_default_log_level,
	set_error_action,
} from '../common/helpers.js';
export { globalLogger as logger } from '../common/logger.global.js';
export type {
	IAbstractConsole,
	IConsole,
	IDebugCommand,
	ILineWriter,
	IMyDebug,
	IMyDebugWithControl,
	IMyLogger,
	IMyLoggerMethods,
} from '../common/types.js';
export { EnableLogLevel } from '../loglevels/loglevel.js';

export { enableLoggerRegistry, getAllLoggerNames, getAllLoggers } from '../common/registry.js';

export interface ILoggerOptions extends Omit<ILoggerOptionsReq, 'console'> {
	readonly console?: IInstrestedConsole;
}
