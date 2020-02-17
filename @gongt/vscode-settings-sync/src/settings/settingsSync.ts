import { workspace, extensions } from 'vscode';
import { logger } from '../logger';

export function createSettingSnapshot() {
	const listAllKeys: string[] = [];
	for (const item of extensions.all) {
		for (const id of Object.keys(item.packageJSON.contributes.configuration.properties)) {
			listAllKeys.push(id);
		}
	}
	const fullConfig = workspace.getConfiguration();
	const body: any = {};
	for (const [key, body] of Object.keys(fullConfig)) {
		if (key.startsWith('[') && key.endsWith(']')) {
			Object.assign(body, flatObject(key, body));
		} else if (typeof body !== 'function') {
			Object.assign(body, flatObject(key, body));
		}
	}
	logger.log(fullConfig);
}

function flatObject(){

}
