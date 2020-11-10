import { CanceledError } from '@idlebox/common';
import { CancellationToken, Progress } from 'vscode';

type MyProgress = Progress<{ message?: string; increment?: number }>;

export function installAll(list: string[]) {
	const increment = 100 / list.length;
	return async (progress: MyProgress, token: CancellationToken) => {
		let i = 1;
		for (const item of list) {
			progress.report({ message: `(${i++}/${list.length}) ${item}` });
			await installOne(item, token);
			if (token.isCancellationRequested) {
				throw new CanceledError();
			}
			progress.report({ increment });
		}
	};
}

function installOne(item: string, token: CancellationToken) {}
