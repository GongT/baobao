import { QuickPickItem, window } from 'vscode';


export const enum MergeType {
	ours,
	theirs,
	manual,
}

export async function mergeFailedMessage(): Promise<MergeType> {
	const selections: (QuickPickItem & { id: MergeType })[] = [
		{
			id: MergeType.ours,
			label: 'Use ours',
			detail: 'using `ours` merge strategy.',
		},
		{
			id: MergeType.theirs,
			label: 'Use theirs',
			detail: 'using reverse `ours` merge strategy.',
		},
		{
			id: MergeType.manual,
			label: 'Resolve Manually',
			detail: 'Open a new VSCode window, resolve them by hand.',
		},
	];
	const r = await window.showQuickPick(selections, {
		placeHolder: 'Automatic merge failed',
		ignoreFocusOut: true,
	});

	if (!r) {
		throw new Error('user cancel');
	}

	return r.id;
}
