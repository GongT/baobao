import { logger, vscodeExtensionActivate, vscodeExtensionDeactivate } from '@gongt/vscode-helpers';
import { ExtensionContext, workspace } from 'vscode';
import { updateMyFolders } from './include/foldersCollect';

export const activate = vscodeExtensionActivate(async function activate(context: ExtensionContext) {
	updateMyFolders();
	context.subscriptions.push(workspace.onDidChangeWorkspaceFolders(updateMyFolders));
});

export const deactivate = vscodeExtensionDeactivate(function deactivate() {
	logger.log('deactivate');
});
