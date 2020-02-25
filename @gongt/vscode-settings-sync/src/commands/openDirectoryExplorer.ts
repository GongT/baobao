import { IAction, extFs } from '@gongt/vscode-helpers';
import { env, Uri } from 'vscode';

export class OpenDirectoryExplorer implements IAction {
	static id = 'open.directory.explorer';
	static label = 'Open settings repo in Explorer';
	static category = 'Settings Sync';

	async run(): Promise<void> {
		await env.openExternal(Uri.file(extFs.getGlobal('repo').path));
	}
	dispose(): void {}
}
