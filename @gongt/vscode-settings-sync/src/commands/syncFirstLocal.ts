import { SyncActionBase } from './syncActionsBase';
import { CancellationTokenWithPromise } from '../common/singleton';
import { MyState } from '../common/state';

export class SyncFirstLocalAction extends SyncActionBase {
	static id = 'sync.local.first';
	static label = 'Sync settings (local first)';
	static category = 'Settings Sync';

	// @ts-ignore
	async _run(cancel: CancellationTokenWithPromise, state: MyState): Promise<boolean> {
		return false;
	}
}
