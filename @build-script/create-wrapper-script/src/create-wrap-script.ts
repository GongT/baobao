import type { WorkspaceBase } from '@build-script/monorepo-lib';
import { isWindows } from '@idlebox/common';
import { commandInPath, isStandardPath, normalizePath, PathEnvironment, relativePath } from '@idlebox/node';
import { tryReadShebang } from '@idlebox/shebang-parse';
import { mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import { split } from 'split-cmd';
import { addExecBit, makeBatBootStrap, makeShBootStrap } from './common/bootstrap.js';
import { identifyScriptType } from './common/file-type.js';
import { defaultWriteFile } from './common/safe.js';
import { bashScript } from './common/script.bash.js';
import { pwshScript } from './common/script.pwsh.js';
import { shebangParse } from './common/shebang.js';
import type { IExtOpt, IOptions, IPaths, ScriptKind } from './common/types.js';

const platformType: ScriptKind = process.platform === 'win32' ? 'powershell' : 'bash';

function rootOf(workspace: WorkspaceBase | string): string;
function rootOf(workspace: WorkspaceBase | string | undefined): string | undefined;
function rootOf(workspace: WorkspaceBase | string | undefined) {
	return typeof workspace === 'string' ? workspace : workspace?.root;
}

/**
 * @param targetFile
 * @returns string 脚本文件内容字符串
 */
export async function createWrapperScript(options: IOptions) {
	const type = options.type ?? platformType;
	const root = rootOf(options.workspace);
	const paths = await resolvePaths(options);
	const isPwsh = type === 'powershell';
	const opt: IExtOpt = {
		targetFile: normalizePath(options.targetFile),
		wrapperFile: isPwsh ? `${options.wrapperFile}.ps1` : options.wrapperFile,
		root,
		writeFile: options.writeFile ?? defaultWriteFile,
	};

	let content = '';
	switch (type) {
		case 'bash':
			content = await bashScript(opt, paths);
			break;
		case 'powershell':
			content = await pwshScript(opt, paths);
			break;
		default:
			throw new Error(`Unsupported script type: ${type}`);
	}

	await mkdir(dirname(opt.wrapperFile), { recursive: true });
	const r = await opt.writeFile(opt.wrapperFile, content);
	if (r !== false && !isWindows) {
		await addExecBit(opt.wrapperFile);
	}

	if (isPwsh) {
		if (isWindows) {
			await makeBatBootStrap(opt.wrapperFile, opt);
		} else {
			await makeShBootStrap(opt.wrapperFile, opt);
		}
	}
}

async function resolvePaths(options: IOptions): Promise<IPaths> {
	const paths = new Set<string>();

	const shebangCommand = (await tryReadShebang(options.targetFile)) || undefined;
	let shebangInterpreter = shebangCommand ? shebangParse(shebangCommand) : undefined;
	if (shebangInterpreter) {
		// 有 shebang，使用 shebang 指定的解释器
		shebangInterpreter = await findInterpreter(shebangInterpreter, options.targetFile);

		if (isAbsolute(shebangInterpreter)) {
			const base = dirname(shebangInterpreter);
			if (!isStandardPath(base)) {
				paths.add(base);
			}
		}
	}

	const extensionInterpreter = identifyScriptType(options.targetFile);
	if (extensionInterpreter) {
		const full_cmd = await findInterpreter(extensionInterpreter[0], options.targetFile);
		if (isAbsolute(full_cmd)) {
			const base = dirname(full_cmd);
			if (!isStandardPath(base)) {
				paths.add(base);
			}
		}
	}

	const r = rootOf(options.workspace);
	if (r) {
		paths.add(resolve(r, 'node_modules/.bin'));

		if (typeof options.workspace === 'string' || !options.workspace) {
		} else {
			const p = await options.workspace.getNearestPackage(options.targetFile);

			if (r !== p.absolute) {
				paths.add(resolve(p.absolute, 'node_modules/.bin'));
			}
		}
	}

	return {
		paths: Array.from(paths),
		shebangCommand: shebangCommand?.slice(2),
		shebangInterpreter: shebangInterpreter,
		extensionInterpreter,
		relative(file: string, must = true) {
			if (!r) {
				return file;
			}
			if (!file.startsWith(r)) {
				if (must) {
					throw new Error(`文件 ${file} 不在工作区根目录 ${r} 内`);
				}
				return file;
			}
			return relativePath(r, file);
		},
	};
}

async function findInterpreter(interpreter: string, targetFile: string) {
	interpreter = split(interpreter)[0];
	if (interpreter && !isAbsolute(interpreter)) {
		const pv = new PathEnvironment();
		const tdir = dirname(targetFile);
		pv.add(tdir);

		const abs = await commandInPath(interpreter);
		if (abs) {
			interpreter = abs;
		} else {
			console.warn(`无法找到解释器"${interpreter}"的绝对路径`);
		}

		pv.delete(tdir);
	} // else -> 已经是绝对路径
	return interpreter;
}
