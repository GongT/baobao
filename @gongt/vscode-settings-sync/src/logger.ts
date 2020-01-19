import { window } from 'vscode';

class Logger {
	private declare output: Chan;

	constructor() {
		const logger = window.createOutputChannel('SettingsSync');
	}
	public log() {}
	public warn() {}
}

export const logger = new Logger();
