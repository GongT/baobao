/**
 * Convert bytes to largest unit, with SI prefix unit (1000), eg: 211.293GB
 * @public
 */
export function humanSizeSI(bytes: number, fixed = 2) {
	if (bytes < 0) {
		return '<0B';
	}
	if (bytes < 1000) {
		return `${bytes}B`;
	}
	if (bytes < 1000000) {
		return `${(bytes / 1000).toFixed(fixed)}KiB`;
	}
	if (bytes < 1000000000) {
		return `${(bytes / 1000000).toFixed(fixed)}MiB`;
	}
	if (bytes < 1000000000000) {
		return `${(bytes / 1000000000).toFixed(fixed)}GiB`;
	}
	if (bytes < 1000000000000000) {
		return `${(bytes / 1000000000000).toFixed(fixed)}TiB`;
	}
	return `${(bytes / 1000000000000000).toFixed(fixed)}PiB`;
}

/**
 * Convert bytes to largest unit, with binary prefix unit (1024), eg: 211.293GiB
 * @public
 */
export function humanSize(bytes: number, fixed = 2) {
	if (bytes < 0) {
		return '<0B';
	}
	if (bytes < 1024) {
		return `${bytes}B`;
	}
	if (bytes < 1048576) {
		// 1024 * 1024
		return `${(bytes / 1024).toFixed(fixed)}KiB`;
	}
	if (bytes < 1073741824) {
		// 1024 * 1024 * 1024
		return `${(bytes / 1048576).toFixed(fixed)}MiB`;
	}
	if (bytes < 1099511627776) {
		// 1024 * 1024 * 1024 * 1024
		return `${(bytes / 1073741824).toFixed(fixed)}GiB`;
	}
	if (bytes < 1125899906842624) {
		// 1024 * 1024 * 1024 * 1024 * 1024
		return `${(bytes / 1099511627776).toFixed(fixed)}TiB`;
	}
	return `${(bytes / 1125899906842624).toFixed(fixed)}PiB`;
}

/** @deprecated */
export function humanSpeed(bps: number) {
	return `${humanSize(bps)}/s`;
}
