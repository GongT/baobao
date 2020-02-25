import { IAction, extFs } from '@gongt/vscode-helpers';
import { spawnWait } from '../common/spawnWait';

export class OpenDirectoryCode implements IAction {
	static id = 'open.directory.code';
	static label = 'Open settings repo in VSCode (new window)';
	static category = 'Settings Sync';

	async run(): Promise<void> {
		await spawnWait('code', ['--wait', extFs.getGlobal('repo').path]);
	}
	dispose(): void {}
}
