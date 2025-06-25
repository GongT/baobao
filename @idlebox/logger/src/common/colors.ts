export enum LogLevel {
	fatal = 0,
	error = 1,
	success = 2,
	warn = 3,
	info = 4,
	log = 5,
	//
	debug = 6,
	verbose = 7,
}

export const logTagColor: Record<LogLevel, string> = {
	[LogLevel.fatal]: '38;5;9;1',
	[LogLevel.error]: '38;5;9',
	[LogLevel.warn]: '38;5;11',
	[LogLevel.log]: '0',
	[LogLevel.info]: '38;5;14',
	[LogLevel.success]: '38;5;10',
	[LogLevel.debug]: '38;5;243',
	[LogLevel.verbose]: '38;5;234',
};

export const logLevelPaddingStr: Record<LogLevel, string> = {
	[LogLevel.fatal]: 'fatal  ',
	[LogLevel.error]: 'error  ',
	[LogLevel.success]: 'success',
	[LogLevel.warn]: 'warn   ',
	[LogLevel.info]: 'info   ',
	[LogLevel.log]: 'log    ',
	[LogLevel.debug]: 'debug  ',
	[LogLevel.verbose]: 'verbose',
};
