import { logger, vscodeExtensionActivate, vscodeExtensionDeactivate } from '@gongt/vscode-helpers';
import { updateMyFolders } from './include/foldersCollect';
import { ExtensionContext, workspace } from 'vscode';

export const activate = vscodeExtensionActivate(function activate(context: ExtensionContext) {
	updateMyFolders();
	context.subscriptions.push(workspace.onDidChangeWorkspaceFolders(updateMyFolders));
});

export const deactivate = vscodeExtensionDeactivate(function deactivate() {
	logger.log('deactivate');
});
