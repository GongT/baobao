import { CSI } from '../constants/sequence.js';
import { reset } from '../terminal.js';

let hasEnabled = false;

/**
 * 启动备用缓冲区
 */
export function enable() {
	if (hasEnabled) return;
	process.stderr.write(`${CSI}?1049h`);
	hasEnabled = true;
}

/**
 * 关闭备用缓冲区
 */
export function disable(clear = false) {
	if (!hasEnabled) return;
	if (clear) reset();
	process.stderr.write(`${CSI}?1049l`);
	hasEnabled = false;
}
