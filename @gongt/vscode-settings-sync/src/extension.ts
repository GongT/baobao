import { ExtensionContext, extensions, workspace, ConfigurationChangeEvent } from 'vscode';
import { SETTING_ID_REMOTE_GIT_URL } from './constants';
import { createSettingSnapshot } from './settings/settingsSync';
import { logger, vscodeExtensionActivate, vscodeExtensionDeactivate } from '@gongt/vscode-helpers';

export const activate = vscodeExtensionActivate(function activate(context: ExtensionContext) {
	logger.log('activate');

	context.subscriptions.push(extensions.onDidChange(onDidExtensionChange));
	onDidExtensionChange();

	context.subscriptions.push(workspace.onDidChangeConfiguration(onDidChangeConfig));
	createSettingSnapshot();
});

export const deactivate = vscodeExtensionDeactivate(function deactivate() {
	logger.log('deactivate');
});

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
