export enum EnableLogLevel {
	auto,
	fatal,
	error,
	warn,
	info,
	log,
	debug,
	verbose,
}

export const availableLevels = ['fatal', 'error', 'warn', 'info', 'log', 'debug', 'verbose', 'success'] as const;
