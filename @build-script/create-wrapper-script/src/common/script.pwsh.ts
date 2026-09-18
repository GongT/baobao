import { isWindows } from '@idlebox/common';
import { isFileExecutable } from '@idlebox/node';
import { safeGuardComment } from './safe.js';
import { findRoot } from './tools.js';
import type { IExtOpt, IPaths } from './types.js';

export async function pwshScript(options: IExtOpt, paths: IPaths) {
	const execLine = [];
	if (isWindows) {
		execLine.push('&');
	} else {
		execLine.push('switch-process');
	}
	const isExec = await isFileExecutable(options.targetFile);
	if (isExec) {
		// 文件可直接执行
	} else if (paths.shebangInterpreter) {
		execLine.push(paths.shebangCommand);
	} else if (paths.extensionInterpreter) {
		const [cmd, ...args] = paths.extensionInterpreter;
		execLine.push(escapePwsh(paths, cmd));
		for (const c of args) {
			execLine.push(JSON.stringify(c));
		}
	}
	execLine.push('$targetFile');

	let src = `#!/usr/bin/env pwsh
${safeGuardComment}

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 3.0

if($PSVersionTable.PSVersion.Major -gt 3)  {
	$basedir = $PSScriptRoot
} else {
	$basedir = split-path -parent $MyInvocation.MyCommand.Path
}
`;

	const r = findRoot(options);
	if (r) {
		src += `
$WORKSPACE_PATH = Join-Path -Resolve $basedir "${r}"
`;
	}

	src += `
$targetFile = ${escapePwsh(paths, options.targetFile)}

$path_arr = $env:Path -split ';'
function _add_path {
	param([string]$p)
	if ($path_arr -contains $p) { return }
	$path_arr += $p
	$env:Path = ($path_arr -join ';')
}

`;

	for (const p of paths.paths) {
		src += `_add_path ${escapePwsh(paths, p)}\n`;
	}

	src += `

${execLine.join(' ')} @args
exit \${LASTEXITCODE}
# cmd-shim-target=${options.targetFile}
`;
	return src;
}

function escapePwsh(paths: IPaths, cmd: string) {
	const rel = paths.relative(cmd, false);
	const r = JSON.stringify(rel);

	if (rel === cmd) {
		return r;
	}

	const inject = `"\${WORKSPACE_PATH}/${r.slice(1, -1)}"`;
	return inject;
}
