import { QuickPickItem, window } from 'vscode';
import { IActionConstructor } from '@gongt/vscode-helpers';
import { SyncFirstLocalAction } from '../commands/syncFirstLocal';
import { SyncFirstRemoteAction } from '../commands/syncFirstRemote';
import { SyncForceLocalAction } from '../commands/syncForceLocal';
import { SyncForceRemoteAction } from '../commands/syncForceRemote';
import { SyncWithGitMergeAction } from '../commands/syncWithGitMerge';

const enum SyncType {
	REMOTE_FIRST,
	LOCAL_FIRST,
	REMOTE_ONLY,
	LOCAL_ONLY,
	GIT_MERGE,
}
export async function selectFirstTimeAction(title: string): Promise<IActionConstructor<boolean>> {
	const selections: (QuickPickItem & { id: SyncType })[] = [
		{
			id: SyncType.REMOTE_FIRST,
			label: 'Remote First',
			detail: 'remote override local',
		},
		{
			id: SyncType.LOCAL_FIRST,
			label: 'Local First',
			detail: 'local override remote',
		},
		{
			id: SyncType.REMOTE_ONLY,
			label: 'Remote Only',
			detail: 'Use remote only, drop local',
		},
		{
			id: SyncType.LOCAL_ONLY,
			label: 'Remote Only',
			detail: 'Use local only, drop remote',
		},
	];
	const r = await window.showQuickPick(selections, {
		placeHolder: title,
		ignoreFocusOut: true,
	});

	if (!r) {
		throw new Error('User canceled');
	}

	switch (r.id) {
		case SyncType.REMOTE_FIRST:
			return SyncFirstRemoteAction;
		case SyncType.LOCAL_FIRST:
			return SyncFirstLocalAction;
		case SyncType.REMOTE_ONLY:
			return SyncForceRemoteAction;
		case SyncType.LOCAL_ONLY:
			return SyncForceLocalAction;
		case SyncType.GIT_MERGE:
			return SyncWithGitMergeAction;
		default:
			throw new Error('User canceled');
	}
}
