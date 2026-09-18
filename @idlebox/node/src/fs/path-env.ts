import { isWindows, normalizePath, PathArray } from '@idlebox/common';
import { PathEnvironment } from '../environment/pathEnvironment.js';

const pathRead = /* @__PURE__ */ new PathEnvironment();
const systemValidator = /* @__PURE__ */ createSystemValidate();
const userValidator = /* @__PURE__ */ createUserValidate();

/**
 * 判断给定路径是否为标准系统路径
 *
 * @param path 要检查的路径，必须是绝对路径
 * @param user 是否也检查用户路径，默认为 false
 */
export function isStandardPath(path: string, user = false) {
	if (isWindows) {
		path = path.toLowerCase();
	}
	path = normalizePath(path);

	if (systemValidator.has(path)) {
		return true;
	}

	if (user) {
		return userValidator.has(path);
	} else {
		return false;
	}
}

const isCommon = /\/(python\d+|powershell)\//i;

function createSystemValidate() {
	const r = new PathArray();
	r.add('/bin');
	r.add('/usr/bin');
	r.add('/usr/local/bin');
	r.add('/sbin');
	r.add('/usr/sbin');
	r.add('/usr/local/sbin');

	if (isWindows) {
		for (const item of pathRead) {
			if (isCommon.test(item)) {
				r.add(item);
			}
		}

		const sr = process.env.SystemRoot;
		if (sr) {
			r.add(sr);
			r.add(`${sr}/system32`);
			r.add(`${sr}/system32/wbem`);
			r.add(`${sr}/system32/WindowsPowerShell/v1.0`);
			r.add(`${sr}/system32/OpenSSH`);
		}
	}

	return r;
}

function createUserValidate() {
	const r = new PathArray();

	if (isWindows) {
		const up = process.env.USERPROFILE;
		if (up) {
			r.add(`${up}/AppData/Local/Microsoft/WindowsApps`);
			r.add(`${up}/AppData/Local/Microsoft/WinGet/Links`);
		}
	} else {
		const up = process.env.HOME;
		if (up) {
			r.add(`${up}/.local/bin`);
		}
	}

	return r;
}
