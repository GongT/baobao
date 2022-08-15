declare const process: any;
declare const navigator: any;

let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isNative = false;
let _isWeb = false;
let _userAgent: string;

export const isElectron =
	typeof process !== 'undefined' &&
	typeof process.versions !== 'undefined' &&
	typeof process.versions.electron !== 'undefined';
export const isElectronRenderer = isElectron && process.type === 'renderer';
export const isElectronMain = !isElectronRenderer;

if (typeof navigator === 'object' && !isElectronRenderer) {
	_userAgent = navigator.userAgent;
	_isWindows = _userAgent.indexOf('Windows') >= 0;
	_isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
	_isLinux = _userAgent.indexOf('Linux') >= 0;
	_isWeb = true;
} else if (typeof process === 'object') {
	_userAgent = `nodejs(${process.versions.node})`;
	if (process.versions.electron) {
		_userAgent += ` electron(${process.versions.electron})`;
		if (isElectronRenderer) {
			_userAgent += ' ' + navigator.userAgent;
		}
	}
	_isWindows = process.platform === 'win32';
	_isMacintosh = process.platform === 'darwin';
	_isLinux = process.platform === 'linux';
	_isNative = true;
} else {
	_userAgent = 'unsupported';
}

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isLinux = _isLinux;
export const isNative = _isNative;
export const isWeb = _isWeb;
export const userAgent = _userAgent;
export const sepList = isWindows ? ';' : ':';
