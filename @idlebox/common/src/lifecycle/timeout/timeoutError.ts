import { humanDate } from '../../date/timeString.js';

/**
 * Error when timeout() done
 * @public
 */
export class TimeoutError extends Error {
	constructor(time: number, what: string = 'no response') {
		super(`Timeout: ${what} in ${humanDate.deltaTiny(time)}`);
	}
}

/** @public */
export function isTimeoutError(error: Error): error is TimeoutError {
	return error instanceof TimeoutError;
}
