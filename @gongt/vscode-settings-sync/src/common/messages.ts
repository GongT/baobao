import { logger } from '@gongt/vscode-helpers';
import { window } from 'vscode';

export function showMissingConfigMessage() {
	return window
		.showInformationMessage('Settings Sync need a git repo to work', { title: 'Input now', id: 1 })
		.then(async (item) => {
			if (item) {
				if (item.id === 1) {
					const ret = await window.showInputBox({
						prompt:
							'Please input(paste) a git repository for store settings, it must exists, but maybe empty.',
						placeHolder: 'eg. git@github.com:your/repo.git',
						ignoreFocusOut: true,
					});
					return ret;
				}
			}
			return undefined;
		});
}

export async function showError(msg: string) {
	const r = await window.showErrorMessage(msg, 'Show log');
	if (r) {
		logger.show();
	}
}
