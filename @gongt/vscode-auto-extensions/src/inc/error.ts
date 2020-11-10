import { logger } from '@gongt/vscode-helpers';
import { window } from 'vscode';

export function alertError(extra: string, e: Error) {
	logger.log(
		'\n--------------------------------\n%s\n%s\n--------------------------------',
		extra,
		e.stack || e.message
	);
	window.showWarningMessage(extra + (e.stack || e.message));
}
