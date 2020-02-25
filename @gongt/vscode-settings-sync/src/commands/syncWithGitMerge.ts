import { extStor, IdCategory, logger, runMyAction, wrapId } from '@gongt/vscode-helpers';
import { OpenDirectoryCode } from './openDirectoryCode';
import { ResolveMergeConflictAction } from './resolveMergeConflictAction';
import { SyncActionBase } from './syncActionsBase';
import { datetimeTag } from '../common/datetimeTag';
import { mergeFailedMessage, MergeType } from '../common/message.mergeSelect';
import { setButton } from '../common/message.save';
import { CancellationTokenWithPromise } from '../common/singleton';
import { MyState } from '../common/state';
import { createSnapshotStatus } from '../common/sync';
import { STORE_ID_CURRENT_VERSION } from '../constants';

function versionValid(state: MyState, currentVersion: string) {
	return state.git('show', '-q', '--oneline', currentVersion).then(
		() => true,
		() => false
	);
}

export class SyncWithGitMergeAction extends SyncActionBase {
	static id = 'sync.auto';
	static label = 'Sync settings';
	static category = 'Settings Sync';

	async _run(cancel: CancellationTokenWithPromise, state: MyState) {
		let currentVersion = extStor.global.get(STORE_ID_CURRENT_VERSION, '');
		logger.debug('current version is:', currentVersion);

		if (currentVersion && (await versionValid(state, currentVersion))) {
			await cancel.able(state.git('reset', '--hard', currentVersion));
		} else {
			logger.warn('  - Invalid version.');

			if (this.isAuto) {
				setButton({
					text: '$(alert)',
					tooltip: 'Merge conflict, please select action',
					command: wrapId(IdCategory.Action, ResolveMergeConflictAction.id),
				});
				this.selfCancel();
			} else {
				await runMyAction(ResolveMergeConflictAction);
			}
			return false;
		}

		await cancel.able(state.git('clean', '-f', '-X', '-d'));
		await cancel.able(createSnapshotStatus(state, true));

		await cancel.able(state.gitAdd());
		logger.info('git add complete.');

		if (!(await state.hasUpdate())) {
			logger.info('  - Local has change.');

			await cancel.able(state.git('commit', '-a', '-m', datetimeTag()));
			const autoMergeOk = await cancel.able(state.git('merge', 'origin/master')).then(
				() => true,
				() => false
			);
			if (autoMergeOk) {
				logger.debug('  * merge success!');
			} else {
				logger.debug('  * merge failed, ask user.');
				await this.handleMerge(await mergeFailedMessage(), state);
			}
		} else {
			logger.info('  - Local has nothing changed.');

			const remoteChanges = await state.git('log', '--oneline', '..master');
			if (remoteChanges.length === 0) {
				logger.info('  - Remote also has nothing changed.');
				return false;
			}

			await state.git('checkout', '--force', 'master');
			await cancel.able(state.git('clean', '-f', '-X', '-d'));
		}

		return true;
	}

	private handleMerge(ret: MergeType, state: MyState) {
		switch (ret) {
			case MergeType.ours:
				return mergeTypeOurs(state);
			case MergeType.theirs:
				return mergeTypeTheirs(state);
			case MergeType.manual:
				return mergeTypeManual();
			default:
				throw new Error('user cancel');
		}
	}
}

async function mergeTypeOurs(state: MyState) {
	await state.git('git', 'merge', '-Xours', 'origin/master');
}
async function mergeTypeTheirs(state: MyState) {
	await state.git('git', 'merge', '-Xtheirs', 'origin/master');
}
async function mergeTypeManual() {
	await runMyAction(OpenDirectoryCode);
}
