import { Action, runMyAction } from '@gongt/vscode-helpers';
import { selectFirstTimeAction } from '../common/message.syncSelect';

export class ResolveMergeConflictAction extends Action<void> {
	static id = 'resolve.git.merge.conflict';
	static label = 'Select how to resolve git merge conflict';
	static category = 'Settings Sync';

	async run() {
		const action = await selectFirstTimeAction('This is the first sync, Please select what to do.');
		setTimeout(() => runMyAction(action), 1000);
	}
}
