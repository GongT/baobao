import { SyncActionBase } from './syncActionsBase';

export class SyncForceLocalAction extends SyncActionBase {
	static id = 'sync.local.force';
	static label = 'Sync settings (use local, drop remote)';
	static category = 'Settings Sync';

	async _run() {
		return false;
	}
}
