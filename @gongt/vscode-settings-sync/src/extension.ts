import {
	context,
	extStor,
	logger,
	registerAction,
	vscodeExtensionActivate,
	vscodeExtensionDeactivate,
} from '@gongt/vscode-helpers';
import { realpathSync } from 'fs';
import { dirname } from 'path';
import { extensions, TextDocument, workspace } from 'vscode';
import { OpenDirectoryCode } from './commands/openDirectoryCode';
import { OpenDirectoryExplorer } from './commands/openDirectoryExplorer';
import { OpenDirectoryTerminal } from './commands/openDirectoryTerminal';
import { ResolveMergeConflictAction } from './commands/resolveMergeConflictAction';
import { ShowLogWindowAction } from './commands/showLogWindow';
import { SyncFirstLocalAction } from './commands/syncFirstLocal';
import { SyncFirstRemoteAction } from './commands/syncFirstRemote';
import { SyncForceLocalAction } from './commands/syncForceLocal';
import { SyncForceRemoteAction } from './commands/syncForceRemote';
import { SyncWithGitMergeAction } from './commands/syncWithGitMerge';
import { triggerAutoSync, triggerAutoSyncNow } from './common/auto';
import { _setSettingsFileFolder, settingsFileFolder } from './common/getDynamicPaths';
import { STORE_ID_LAST_UPDATE } from './constants';

export const activate = vscodeExtensionActivate(async function activate() {
	await _setSettingsFileFolder();

	registerAction(OpenDirectoryCode, true);
	registerAction(OpenDirectoryExplorer, true);
	registerAction(OpenDirectoryTerminal, true);
	registerAction(SyncFirstLocalAction, true);
	registerAction(SyncForceLocalAction, true);
	registerAction(SyncFirstRemoteAction, true);
	registerAction(SyncForceRemoteAction, true);
	registerAction(SyncWithGitMergeAction, true);

	registerAction(ShowLogWindowAction, false);
	registerAction(ResolveMergeConflictAction, false);

	context.subscriptions.push(extensions.onDidChange(triggerAutoSync));
	context.subscriptions.push(workspace.onDidSaveTextDocument(detectDocumetPath));
	triggerAutoSync();

	if (extStor.global.get<number>(STORE_ID_LAST_UPDATE, 0) < Date.now() - 1000 * 60 * 60) {
		logger.warn('trigger auto local sync now.');
		setTimeout(() => triggerAutoSync.flush(), 2000);
	} else if (context.isDevelopment) {
		logger.warn('== Debug Mode ==');
		setTimeout(() => triggerAutoSync.flush(), 2000);
	}
});

export const deactivate = vscodeExtensionDeactivate(async function deactivate() {
	logger.log('deactivate');
	await triggerAutoSyncNow();
});

async function detectDocumetPath(e: TextDocument) {
	if (e.languageId === 'jsonc') {
		if (realpathSync(dirname(e.fileName)) === settingsFileFolder) {
			console.log('detectDocumetPath: settings file changed', e.fileName);
			await triggerAutoSyncNow();
		}
	}
}
