import { workspace } from 'vscode';
import { logger } from '@gongt/vscode-helpers';

const myFolders: string[] = [];

export function updateMyFolders() {
	logger.log('Update My Folders');
	myFolders.length = 0;
	if (workspace.workspaceFolders) {
		for (const wf of workspace.workspaceFolders) {
			const f = wf.uri.toString();
			myFolders.push(f);
			logger.log(' * ', f);
		}
	}
}
