import { sleep, TimeoutError } from '@idlebox/common';

interface IRetryOptions extends RequestInit {
	retries?: number; // Number of retries
	delay?: number; // Delay between retries in milliseconds
	timeout?: number; // Optional timeout for each fetch attempt in milliseconds
}

export async function retryFetch(url: string, { retries = 3, delay = 800, timeout = 3500, signal, ...options }: IRetryOptions): Promise<Response> {
	while (retries-- > 0) {
		const timeoutAbort = new AbortController();
		signal?.addEventListener('abort', () => {
			timeoutAbort.abort(signal.reason);
		});
		const timer = setTimeout(() => {
			timeoutAbort.abort(new TimeoutError(timeout));
		}, timeout);

		try {
			return await fetch(url, {
				signal: timeoutAbort.signal,
				...options,
			});
		} catch (e) {
			if (e instanceof TimeoutError) {
				await sleep(delay);
				continue;
			}
			throw e;
		} finally {
			clearTimeout(timer);
		}
	}

	throw new Error(`Failed to fetch ${url} after multiple attempts`);
}
