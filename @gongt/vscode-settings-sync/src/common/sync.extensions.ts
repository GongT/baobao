import { context, logger } from '@gongt/vscode-helpers';
import { ExtensionKind, extensions } from 'vscode';
import { MyState } from './state';

const endsWithNumber = /\.[0-9]+$/;

export async function handleExtensions(state: MyState) {
	let counter = 0;
	for (const item of extensions.all) {
		if (item.id === context.extensionName.id) {
			continue;
		}
		if (!endsWithNumber.test(item.extensionPath)) {
			if (!item.id.startsWith('vscode.')) {
				logger.debug('Not sync "%s".', item.id);
			}
			continue;
		}

		const change = await state.writeExtension(item.id, {
			isUIExtension: item.extensionKind === ExtensionKind.UI,
		});

		if (change) counter++;
	}

	logger.info('  %d extension(s) change.', counter);
}
