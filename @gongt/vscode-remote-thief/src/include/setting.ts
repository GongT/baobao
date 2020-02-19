import { logger } from '@gongt/vscode-helpers';
import { platform, userInfo } from 'os';
import { resolve } from 'path';
import { workspace } from 'vscode';

interface IMyConfig {
	binaryPath: string;
	binaryName: string;
}
const defaultConfig: IMyConfig = {
	binaryName: 'code',
	binaryPath: '',
};

export function getBinaryPath() {
	let ext = '';
	if (platform() === 'win32') {
		ext = '.bat';
	}
	let path = getConfig('binaryPath');
	if (!path) {
		path = detectPath();
	}
	return resolve(path, getConfig('binaryName') + ext);
}
function getConfig<T extends keyof IMyConfig>(key: T): IMyConfig[T] {
	logger.log(workspace.getConfiguration('remote.thief').inspect(key));
	return workspace.getConfiguration('remote.thief').get(key) || defaultConfig[key];
}
function detectPath() {
	if (platform() === 'win32') {
		throw new Error('sorry, windows is not supported currentlly.');
	}
	const { uid, homedir } = userInfo();
	let p: string = resolve(homedir, '.bin');
	if ((process.env.PATH || process.env.Path || '').includes(p)) {
		return p;
	}
	p = uid === 0 ? '/usr/local/bin' : resolve(homedir, '/.bin');
	if ((process.env.PATH || process.env.Path || '').includes(p)) {
		return p;
	}
	throw new Error('Cannot find where to store binary file.');
}
