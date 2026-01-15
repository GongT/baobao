import type { IMyLogger } from '@idlebox/logger';

export let plogger: IMyLogger;

export function useLogger(logger: IMyLogger) {
	plogger = logger;
}
