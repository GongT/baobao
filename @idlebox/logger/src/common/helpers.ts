import { argv } from '@idlebox/args/default';
import process from 'node:process';
import { terminal } from './root-logger.js';

export function isTruthyString(value: string | undefined) {
	if (!value) return false;

	value = value.toLowerCase();
	if (value === '1' || value === 'true' || value === 'on' || value === 'yes' || value === 'enabled') {
		return true;
	} else if (value === '0' || value === 'false' || value === 'off' || value === 'no' || value === 'disabled') {
		return false;
	} else {
		terminal.warn`invalid boolean string: ${value}, assuming false.`;
		return false;
	}
}

export const colorEnabled = (() => {
	const colorArg = argv.flag(['--color']);

	// 命令行顶级优先
	if (colorArg > 0) return true;
	if (colorArg < 0) return false;

	// 环境变量强制
	if (process.env.NO_COLOR || process.env.NODE_DISABLE_COLORS === '1') {
		/**
		 * https://force-color.org/
		 * https://nodejs.org/docs/latest/api/cli.html#node_disable_colors1
		 */
		return false;
	} else if (process.env.FORCE_COLOR) {
		return true;
	}

	// 检测其他可能
	if (process.stderr.isTTY) {
		return true;
	}

	return false;
})();
