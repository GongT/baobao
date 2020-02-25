import { context } from '@gongt/vscode-helpers';
import { realpath } from 'fs-extra';
import { resolve } from 'path';

export let settingsFileFolder: string;

export async function _setSettingsFileFolder() {
	if (process.env.VSCODE_PORTABLE) {
		settingsFileFolder = await realpath(resolve(process.env.VSCODE_PORTABLE, 'user-data/User'));
	} else {
		// when portable, this also right
		settingsFileFolder = await realpath(resolve(context.globalStoragePath, '../..'));
	}
}
