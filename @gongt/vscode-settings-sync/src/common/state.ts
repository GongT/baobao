import { extFs, logger } from '@gongt/vscode-helpers';
import { pathExists, readdir, remove } from 'fs-extra';
import { resolve } from 'path';
import { ConfigurationTarget, workspace } from 'vscode';
import { showMissingConfigMessage } from './messages';
import { spawnWait } from './spawnWait';
import { SETTING_ID_GIT_IGNORE, SETTING_ID_REMOTE_GIT_URL } from '../constants';

export class MyState {
	public readonly gitRepoDir: string = extFs.getGlobal('repo').path;
	constructor(public readonly remote: string) {}

	get gitBin() {
		return workspace.getConfiguration('git').get<string>('path') || 'git';
	}

	async hasUpdate() {
		const changed = await this.git('git', 'diff-index', '--quiet', 'HEAD', '--').then(
			() => false,
			() => true
		);
		logger.debug('git changed?', changed ? 'yes' : 'no');
		return changed;
	}

	private knownExtension: string[] = [];

	public writeExtension(id: string, value: any) {
		this.knownExtension.push(id);
		return extFs.getGlobal(`repo/extensions/${id}.json`).writeJson(value);
	}

	private knownKeybinding: string[] = [];

	public writeKeybinding(id: string, value: any) {
		this.knownKeybinding.push(id);
		return extFs.getGlobal(`repo/keybindings/${id}.json`).writeJson(value);
	}

	private knownSetting: string[] = [];

	public writeSetting(id: string, value: any) {
		this.knownSetting.push(id);
		return extFs.getGlobal(`repo/settings/${id}.json`).writeJson(value);
	}

	public unsetSetting(id: string) {
		return extFs.getGlobal(`repo/settings/${id}.json`).remove();
	}

	public async cleanupUnused() {
		logger.info(
			'summary: extensions=%d, settings=%d, keybindings=%d',
			this.knownExtension.length,
			this.knownSetting.length,
			this.knownKeybinding.length
		);

		const root = extFs.getGlobal('repo').path;

		this.clean(resolve(root, 'extensions'), this.knownExtension);
		this.clean(resolve(root, 'keybindings'), this.knownKeybinding);

		for (const item of await readdir(root)) {
			if (!['settings', 'extensions', 'keybindings', '.git'].includes(item)) {
				logger.warn('delete unknown object "%s"', item);
				await remove(resolve(root, item));
			}
		}
	}

	private async clean(root: string, known: string[]) {
		for (const item of await readdir(root)) {
			if (item.endsWith('.json')) {
				const key = item.replace(/\.json$/, '');
				if (known.includes(key)) {
					continue;
				}
			}
			logger.warn('delete unknown item "%s"', item);
			await remove(resolve(root, item));
		}
	}

	async gitAdd() {
		await this.git('rm', '--cached', 'extensions').catch(() => undefined);
		await this.git('rm', '--cached', 'settings').catch(() => undefined);
		await this.git('rm', '--cached', 'keybindings').catch(() => undefined);
		await this.git('add', '.');
	}

	git(...args: string[]) {
		return spawnWait(this.gitBin, args, this.gitRepoDir);
	}
}
export async function createState(): Promise<MyState> {
	let detectRemote = workspace.getConfiguration().get<string>(SETTING_ID_REMOTE_GIT_URL);
	let tryRemote = false;

	logger.log('createState: ==================');
	logger.debug('  remote url from setting: %s', detectRemote);

	if (!detectRemote) {
		detectRemote = await showMissingConfigMessage();
		logger.info('  user input url: %s', detectRemote);
		if (!detectRemote) {
			throw new Error('Settings repo url is required');
		}
		tryRemote = true;
	}
	const remote = detectRemote;

	const state = new MyState(remote);

	const gitRepoDir = state.gitRepoDir;
	logger.debug(`  git repo directory: ${gitRepoDir}`);

	const gitBin = state.gitBin;
	logger.debug('  git binary: %s', gitBin);

	const dotGit = resolve(gitRepoDir, '.git');

	if (await pathExists(dotGit)) {
		const currentRemote = await state.git('remote', 'get-url', 'origin').catch(() => '');
		logger.info('  current remote url: %s', currentRemote);
		if (currentRemote === remote) {
			logger.debug('REMOTE: ok.');
		} else {
			if (currentRemote) {
				logger.warn('REMOTE: change.');
			} else {
				logger.info('REMOTE: not exists.');
			}
			await remove(gitRepoDir);
		}
	}

	if (await pathExists(dotGit)) {
		logger.log('directory exists, run fetch:');
		await state.git('fetch', 'origin');
	} else {
		logger.log('directory NOT exists, run clone:');
		await spawnWait(state.gitBin, ['clone', remote, gitRepoDir], state.gitRepoDir);
	}

	const ignores = workspace.getConfiguration().get<string[]>(SETTING_ID_GIT_IGNORE, []);
	if (!Array.isArray(ignores)) {
		throw new Error(`config section ${SETTING_ID_GIT_IGNORE} has wrong value, it must be a string array.`);
	}
	ignores.unshift(SETTING_ID_REMOTE_GIT_URL);
	const ignoreFile: string[] = [];
	for (const item of ignores) {
		ignoreFile.push(`extensions/${item}.json`);
		ignoreFile.push(`settings/${item}.json`);
	}
	extFs.getGlobal('repo/.git/info/exclude').writeText(ignoreFile.join('\n'));

	if (tryRemote) {
		logger.info('Update new sync git repo setting!');
		workspace.getConfiguration().update(SETTING_ID_REMOTE_GIT_URL, remote, ConfigurationTarget.Global);
	}

	logger.log('State created==================');
	return state;
}
