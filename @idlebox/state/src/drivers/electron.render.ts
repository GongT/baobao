declare const process: any;

function isValidRender() {
	if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
		return true;
	} else {
		return false;
	}
}

export function createElectronRendererDriver() {
	if (!isValidRender()) {
		throw new Error('not valid electron renderer process environment');
	}
}
