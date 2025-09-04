import { logger } from '@idlebox/cli';
import { addDisposableEventListener, EnhancedDisposable } from '@idlebox/common';
import { execa } from 'execa';

class Autofix extends EnhancedDisposable {
	private currentFile?: string;

	constructor() {
		super();
		this.onInput = this.onInput.bind(this);
		this._register(addDisposableEventListener(process.stdin, 'data', this.onInput));
	}

	private async onInput(buff: Buffer) {
		const hasNewLine = buff.toString().includes('\n');
		if (!hasNewLine) return;
		if (!this.currentFile) return;

		console.log('applying fix for %s', this.currentFile);

		const result = await execa({ cwd: process.cwd(), reject: false, stdio: ['ignore', 'pipe', 'inherit'] })`biome check --fix --unsafe ${this.currentFile}`;
		if (result.exitCode !== 0) {
			logger.error`autofix failed: ${result.exitCode}`;
		} else {
			logger.success`autofix applied.`;
		}
	}

	prompt(target_file: string) {
		this.currentFile = target_file;
		console.log('press Enter to apply fixable issues.');
	}

	detach() {
		this.currentFile = undefined;
	}
}

export const autofix = new Autofix();
