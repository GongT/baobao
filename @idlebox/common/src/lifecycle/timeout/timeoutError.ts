import { humanDate } from '../../date/timeString.js';

/**
 * Error when timeout() done
 * @public
 */
export class TimeoutError extends Error {
	constructor(time: number, what = 'no response') {
		super(`Timeout: ${what} in ${humanDate.deltaTiny(time)}`);
	}

	static is = isTimeoutError;
}

/** @public */
export function isTimeoutError(error: unknown): error is TimeoutError {
	return error instanceof TimeoutError;
}
