import { logger, runMyAction } from '@gongt/vscode-helpers';
import { debounce } from 'debounce';
import { SyncWithGitMergeAction } from '../commands/syncWithGitMerge';
import { showError } from '../common/messages';
import { myExtension } from '../commands/syncActionsBase';

async function triggerAutoSyncRun() {
	try {
		return await runMyAction(SyncWithGitMergeAction, [myExtension]);
	} catch (e) {
		showError(e.message);
		logger.error(e.stack);
		e.stack = e.message;
		throw e;
	}
}
export function triggerAutoSyncNow() {
	triggerAutoSync.clear();
	return triggerAutoSyncRun();
}

export const triggerAutoSync = debounce<() => Promise<boolean>>(triggerAutoSyncRun, 60 * 1000);
