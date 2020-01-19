import * as vscode from 'vscode';
import { inspect } from 'util';
import { platform, userInfo } from 'os';
import { resolve } from 'path';

interface IMyConfig {
	binaryPath: string;
	binaryName: string;
}

export 
function activate(context: vscode.ExtensionContext) {
	logger.show(false);

	updateMyFolders();
	context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(updateMyFolders));
}
export 
function deactivate() {
	logger.appendLine('deactivate');
}
