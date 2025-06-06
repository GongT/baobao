export { LogLevel, logTagColor } from './common/colors.js';
export { all_logger_names } from './common/create.js';
export { createDebug } from './common/debug-fn.js';
export {
	color_enabled,
	debug_enabled,
	is_string_truthy,
	match_disabled,
	match_enabled,
	set_default_log_level,
} from './common/helpers.js';
export { createLogger } from './common/logger.create.js';
export {
	createGlobalLogger as createRootLogger,
	terminal as logger,
} from './common/logger.global.js';
export {
	EnableLogLevel,
	type IMyDebug,
	type IMyDebugWithControl,
	type IMyLogger,
} from './common/types.js';
export { createLogFile } from './printers/file.js';
