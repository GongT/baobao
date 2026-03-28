import type { IRefreshMessage } from '../common/message.types.js';
import { postMessage } from './bridge.js';
import { logger } from './logger.js';

let timeout: NodeJS.Timeout | undefined;

function send() {
	logger.worker`refresh master timeout`;
	postMessage({ type: 'refresh' } satisfies IRefreshMessage);
	timeout = undefined;
}

export function debounceRefresh() {
	if (timeout) return;

	timeout = setTimeout(send, 100);
}
