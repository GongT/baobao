import { Action, extFs } from '@gongt/vscode-helpers';
import { platform } from 'os';
import { Terminal, window } from 'vscode';

export class OpenDirectoryTerminal extends Action<void> {
	static id = 'open.directory.terminal';
	static label = 'Open settings repo in Terminal';
	static category = 'Settings Sync';

	private term: Terminal | null = null;

	async run(): Promise<void> {
		this.term = window.createTerminal({
			name: 'Settings Sync Merge',
			shellPath: platform() === 'win32' ? 'powershell.exe' : undefined,
			cwd: extFs.getGlobal('repo').path,
		});
	}
	dispose(): void {
		if (this.term) this.term.dispose();
	}
}
