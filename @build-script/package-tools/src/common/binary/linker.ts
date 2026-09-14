import { logger as globalLog, type IMyLogger } from '@idlebox/cli';
import { isWindows } from '@idlebox/common';
import { ensureLinkTargetSync } from '@idlebox/ensure-symlink';
import { relativePath } from '@idlebox/node';
import { openSync, readSync, statSync } from 'node:fs';

interface IOptions {
	/**
	 * 二进制文件所在的目录
	 */
	readonly binaryDirectory: string;

	/**
	 * 二进制文件的名称
	 */
	readonly name: string;

	/**
	 * 二进制文件的目标路径（绝对）
	 */
	readonly target: string;

	/**
	 * 只打印，不实际创建文件
	 */
	readonly dry: boolean;

	/**
	 * 日志记录器
	 */
	readonly logger?: IMyLogger;
}

enum BinaryType {
	// 直接可执行的二进制文件，直接创建符号链接
	DirectBinary,
	// 需要桥接shebang
	WrapShebang,
	// 需要创建带解释器的启动器（标准npm wrapper）
	WrapInterpreter,
}

/**
 * 创建二进制文件
 */
export function createBinary(options: IOptions) {
	const logger = options.logger ?? globalLog;
	const { binaryDirectory: bindir, name, target, dry } = options;

	const link = `${bindir}/${name}`;
	const rel = relativePath(bindir, target);
	if (dry) {
		logger.success(`Would link ${link} -> ${rel}`);
	} else {
		const ch = ensureLinkTargetSync(rel, link);
		if (ch) {
			logger.success`symlink: ${name} -> ${rel}`;
		} else {
			logger.debug`unchanged: ${name} -> ${rel}`;
		}
	}
}

/**
 * 识别二进制文件的类型
 *
 * 不可执行的文件必然需要某种包装
 *    - 有shebang的，走修改逻辑（实际不修改）
 *    - 无shebang的，走wrapper逻辑（根据文件名判断）
 * 可直接执行的文件分为:
 *    - 无需处理直接链接的（二进制或有无需修改的shebang）
 *    - 需要修改shebang的脚本，走修改逻辑
 *    - 没有shebang的，走wrapper逻辑（根据文件名判断）
 *
 * 因此所有shebang都需要分析，以确定是否需要修改
 */
function _identifyBinaryType(target: string, _logger: IMyLogger): BinaryType {
	const ss = statSync(target);
	if (!isWindows && !(ss.mode & 0o100)) {
		// posix系统上，文件没有u=x位
	} else if (isWindows) {
		// windows 不支持可执行权限功能
	}

	const fh = openSync(target, 'r');
	const firstByte = Buffer.alloc(2);
	if (readSync(fh, firstByte, 0, 2, 0) === 2) {
		if (firstByte[0] === 0x23 && firstByte[1] === 0x21) {
			return BinaryType.WrapShebang;
		} else {
			return BinaryType.DirectBinary;
		}
	}
	return BinaryType.WrapInterpreter;
}
