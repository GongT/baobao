import { logger } from '@gongt/vscode-helpers';
import { MyState } from './state';
import { handleExtensions } from './sync.extensions';
import { handleKeybindings } from './sync.keybindings';
import { createSettingSnapshot } from './sync.settings';

export async function createSnapshotStatus(state: MyState, cleanup = true) {
	logger.debug('Creating settings snapshot:');
	const start1 = Date.now();
	await handleExtensions(state);
	logger.debug(' * dump extensions takes %dms', Date.now() - start1);

	const start2 = Date.now();
	await createSettingSnapshot(state);
	logger.debug(' * dump settings takes %dms', Date.now() - start2);

	const start3 = Date.now();
	await handleKeybindings(state);
	logger.debug(' * dump keybindings takes %dms', Date.now() - start3);

	if (cleanup) {
		const start4 = Date.now();
		await state.cleanupUnused();
		logger.debug(' * cleanup takes %dms', Date.now() - start4);
	}
	logger.debug('');
}
