import { Action, logger } from '@gongt/vscode-helpers';
import { disposeButton } from '../common/message.save';

export class ShowLogWindowAction extends Action<void> {
	static id = 'show.log';
	static label = 'Show debug log';
	static category = 'Settings Sync';

	run() {
		logger.show();
		disposeButton();
		return Promise.resolve();
	}
}
