export function humanSize(bytes: number, fixed = 2) {
	if (bytes < 0) {
		return '<0B';
	} else if (bytes < 1024) {
		return bytes + 'B';
	} else if (bytes < 1048576) {
		// 1024 * 1024
		return (bytes / 1024).toFixed(fixed) + 'KB';
	} else if (bytes < 1073741824) {
		// 1024 * 1024 * 1024
		return (bytes / 1048576).toFixed(fixed) + 'MB';
	} else if (bytes < 1099511627776) {
		// 1024 * 1024 * 1024 * 1024
		return (bytes / 1073741824).toFixed(fixed) + 'GB';
	} else if (bytes < 1125899906842624) {
		// 1024 * 1024 * 1024 * 1024 * 1024
		return (bytes / 1099511627776).toFixed(fixed) + 'TB';
	} else {
		return (bytes / 1125899906842624).toFixed(fixed) + 'PB';
	}
}

export function humanSpeed(bps: number) {
	return humanSize(bps) + '/s';
}
