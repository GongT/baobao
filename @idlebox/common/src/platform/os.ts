declare const process: any;
declare const navigator: any;
declare const window: any;
declare const global: any;

/**
 * buy detect process.pid, is there any bundler mock this?
 */
export const hasProcess = typeof process?.pid === 'number';
export const hasWindow = typeof window !== 'undefined' && globalThis === window;
export const hasGlobal = typeof global !== 'undefined' && globalThis === global;

export let isElectron = false,
	isElectronSandbox = false,
	isElectronRenderer = false,
	isElectronMain = false;
if (hasProcess) {
	if (typeof process.versions?.electron !== 'undefined') {
		isElectron = true;
		if (process.type === 'renderer') {
			isElectronRenderer = true;
		} else {
			isElectronMain = true;
		}
	}
} else if (hasWindow) {
	if (window.navigator.userAgent.includes(' Electron/')) {
		isElectron = true;
		isElectronRenderer = true;
		isElectronSandbox = true;
	}
}

export let isWindows = false;
export let isMacintosh = false;
export let isLinux = false;
export let isNative = false;
export let isNodeJs = false;
export let isWeb = false;
export let is64Bit = false;

if (hasWindow && !hasProcess) {
	const userAgent = navigator.userAgent;
	isWindows = userAgent.includes('Windows NT');
	isMacintosh = userAgent.includes('Macintosh');
	isLinux = userAgent.includes('Linux');
	isWeb = true;
	is64Bit = userAgent.includes('x64');
} else if (hasProcess) {
	isNative = true;
	isNodeJs = typeof process.versions?.node === 'string';
	is64Bit = process.arch === 'x64';
	if (process.platform === 'linux') {
		isLinux = true;
	} else if (process.platform === 'darwin') {
		isMacintosh = true;
	} else if (process.platform === 'win32') {
		isWindows = true;
	}
}

export const sepList = isWindows ? ';' : ':';
export const is32Bit = !is64Bit;
