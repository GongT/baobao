import * as vscode from 'vscode';
import { inspect } from 'util';
import { platform, userInfo } from 'os';
import { resolve } from 'path';

interface IMyConfig {
	binaryPath: string;
	binaryName: string;
}
const defaultConfig: IMyConfig = {
	binaryName: 'code',
	binaryPath: detectPath(),
};

let logger: vscode.OutputChannel;
let myFolders: string[] = [];

function updateMyFolders() {
	logger.appendLine('Update My Folders');
	myFolders = vscode.workspace.workspaceFolders?.map((f) => f.uri.toString()) || [];
	myFolders.forEach((i) => logger.appendLine('*  ' + i));
}

function activate(context: vscode.ExtensionContext) {
	logger = vscode.window.createOutputChannel('Remote Thief');
	logger.show(false);

	updateMyFolders();
	context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(updateMyFolders));
}

function deactivate() {
	logger.appendLine('deactivate');
}

module.exports = {
	activate,
	deactivate,
};

function getBinaryPath() {
	let ext = '';
	if (platform() === 'win32') {
		ext = '.bat';
	}
	return resolve(getConfig('binaryPath'), getConfig('binaryName') + ext);
}
function getConfig<T extends keyof IMyConfig>(key: T): IMyConfig[T] {
	return vscode.workspace.getConfiguration('remote.thief').get(key) || defaultConfig[key];
}
function detectPath() {
	if (platform() === 'win32') {
		throw new Error('sorry, windows is not supported currentlly.');
	}
	const { uid, homedir } = userInfo();
	if (uid === 0) {
		return '/usr/local/bin';
	} else {
		return resolve(homedir, '.bin');
	}
}
