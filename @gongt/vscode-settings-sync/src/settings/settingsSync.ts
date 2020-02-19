import { workspace, extensions } from 'vscode';
import { logger } from '@gongt/vscode-helpers';

export function createSettingSnapshot() {
	const listAllKeys: string[] = [];
	for (const item of extensions.all) {
		for (const id of Object.keys(item.packageJSON.contributes?.configuration?.properties || {})) {
			listAllKeys.push(id);
		}
	}
	const fullConfig = workspace.getConfiguration();
	logger.log(fullConfig);
}
