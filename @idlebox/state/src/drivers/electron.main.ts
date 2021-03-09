declare const process: any;

export interface IElectronOptions {
	electron: true;
	nodeipc?: boolean;
}

function isValidMain() {
	if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
		return true;
	} else {
		return false;
	}
}

export function createElectronMainDriver() {
	if (!isValidMain()) {
		throw new Error('not valid electron main process environment');
	}
}
