import { logger } from '@gongt/vscode-helpers';

export let api = {
	async getDisabledList(): Promise<string[]> {
		return ['test'];
	},
	async setDisabledList(list: string[]): Promise<void> {
		logger.error('WOW!', list);
	},
	async installExtensions(list: string[]): Promise<void> {
		logger.info('Install extensions:', list);
	},
};
