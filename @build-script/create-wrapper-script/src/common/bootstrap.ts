import { commandInPath } from '@idlebox/node';
import { chmod, stat } from 'node:fs/promises';
import { basename, dirname } from 'node:path';
import { safeGuardComment, safeGuardCommentBat } from './safe.js';
import type { IExtOpt } from './types.js';

let pwsh: Promise<string | undefined> | undefined;
// 在 Windows 上创建调用ps1的bat脚本，用于非pwsh运行
export async function makeBatBootStrap(file: string, opts: IExtOpt) {
	if (!pwsh) {
		pwsh = commandInPath('pwsh', ['.exe']);
	}
	const pwshPath = (await pwsh) ?? 'powershell.exe';
	const content = `${safeGuardCommentBat}
@echo off
"${pwshPath}" -NoProfile -ExecutionPolicy Bypass -File "${file}" %*
`;

	// replace .ps1 with .bat
	await opts.writeFile(`${file.slice(0, -4)}.bat`, content);
}

// 在 Posix 上创建调用ps1的sh脚本，用于非pwsh运行
export async function makeShBootStrap(file: string, opts: IExtOpt) {
	const content = `#!/bin/sh
${safeGuardComment}

basedir=$(dirname "$(echo "$0" | sed -e 's|\\\\|/|g')")
exec "pwsh" -File "\${basedir}/${basename(file)}" "$@"
exit 1
`;

	// remove .ps1
	const sh = `${dirname(file)}/${basename(file, '.ps1')}`;
	const r = await opts.writeFile(sh, content);
	if (r !== false) {
		await addExecBit(sh);
	}
}

// chmod a+x file
export async function addExecBit(file: string) {
	const { mode } = await stat(file);
	await chmod(file, mode | 0o111);
}
