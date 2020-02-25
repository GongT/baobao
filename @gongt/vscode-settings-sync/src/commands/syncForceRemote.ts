import { SyncActionBase } from './syncActionsBase';

export class SyncForceRemoteAction extends SyncActionBase {
	static id = 'sync.remote.force';
	static label = 'Sync settings (drop local, use remote)';
	static category = 'Settings Sync';

	async _run() {
		return false;
	}
}
