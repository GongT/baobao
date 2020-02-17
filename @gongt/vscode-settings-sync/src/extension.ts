import { ExtensionContext, extensions, workspace, ConfigurationChangeEvent } from 'vscode';
import { logger } from './logger';
import { SETTING_ID_REMOTE_GIT_URL } from './constants';
import { createSettingSnapshot } from './settings/settingsSync';
/*
interface IMyConfig {
	repo: string;
}
*/
export function activate(context: ExtensionContext) {
	logger.log('activate');

	global.vscode = require('vscode');

	context.subscriptions.push(extensions.onDidChange(onDidExtensionChange));
	onDidExtensionChange();

	context.subscriptions.push(workspace.onDidChangeConfiguration(onDidChangeConfig));
	createSettingSnapshot();
}
export function deactivate() {
	logger.log('deactivate');
}

function onDidExtensionChange() {
	logger.log(
		'onDidExtensionChange',
		extensions.all.map((e) => e.id)
	);
}
function onDidChangeConfig(event: ConfigurationChangeEvent) {
	logger.log('settings changing', event.affectsConfiguration(SETTING_ID_REMOTE_GIT_URL));
	createSettingSnapshot();
}
