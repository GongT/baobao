import { SyncActionBase } from './syncActionsBase';
import { CancellationTokenWithPromise } from '../common/singleton';
import { MyState } from '../common/state';

export class SyncFirstRemoteAction extends SyncActionBase {
	static id = 'sync.remote.first';
	static label = 'Sync settings (remote first)';
	static category = 'Settings Sync';

	// @ts-ignore
	async _run(cancel: CancellationTokenWithPromise, state: MyState): Promise<boolean> {
		return false;
	}
}
