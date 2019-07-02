import { timeStringTiny } from '../process/string/timeString';

export class TimeoutError extends Error {
	constructor(time: number, what: string = 'no response') {
		super(`Timeout: ${what} in ${timeStringTiny(time)}`);
	}
}

export function isTimeoutError(error: Error): error is TimeoutError {
	return error instanceof TimeoutError;
}
