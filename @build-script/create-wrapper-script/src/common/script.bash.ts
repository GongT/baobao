import { isFileExecutable } from '@idlebox/node';
import { safeGuardComment } from './safe.js';
import { findRoot } from './tools.js';
import type { IExtOpt, IPaths } from './types.js';

export async function bashScript(options: IExtOpt, paths: IPaths) {
	let src = `#!/usr/bin/bash
${safeGuardComment}

set -Eeuo pipefail

basedir=$(dirname "$(echo "$0" | sed -e 's|\\\\|/|g')")
exe=""

case "$(uname)" in
	*CYGWIN*|*MINGW*|*MSYS*)
		if command -v cygpath > /dev/null 2>&1; then
			basedir=$(cygpath -w "$basedir")
		fi
		exe=".exe"
	;;
	
	*WSL2*)
		if command -v wslpath > /dev/null 2>&1; then
			basedir_win="$(wslpath -w "$basedir" 2> /dev/null)"
			if [ $? -ne 0 ] || [ -z "$basedir_win" ]; then
				basedir_win="$basedir"
			else
				exe=".exe"
			fi
		fi
	;;
esac
`;

	const r = findRoot(options);
	if (r) {
		src += `
WORKSPACE_PATH="$basedir/${r}"
if command -v realpath > /dev/null 2>&1; then
	WORKSPACE_PATH=$(realpath "$WORKSPACE_PATH")
else
	WORKSPACE_PATH=$(cd "$WORKSPACE_PATH" && pwd)
fi
`;
	}

	src += `
_add_path() {
	p="$1"
	if  [[ " $PATH " != *" $p "* ]]; then
		PATH="$p:$PATH"
	fi
}

`;

	for (const p of paths.paths) {
		src += `_add_path ${escapeBash(paths, p)}\n`;
	}

	src += '\nexec ';

	const isExec = await isFileExecutable(options.targetFile);
	if (isExec) {
		// 文件可直接执行
	} else if (paths.shebangInterpreter) {
		src += paths.shebangCommand;
	} else if (paths.extensionInterpreter) {
		const [cmd, ...args] = paths.extensionInterpreter;
		src += escapeBash(paths, cmd);
		for (const c of args) {
			src += ` ${JSON.stringify(c)}`;
		}
	}

	src = src.trimStart();
	src += ` ${escapeBash(paths, options.targetFile)} "$@"
exit 1
# cmd-shim-target=${options.targetFile}
`;

	return src;
}

function escapeBash(paths: IPaths, cmd: string) {
	const rel = paths.relative(cmd, false);
	const r = JSON.stringify(rel);

	if (rel === cmd) {
		return r;
	}

	const inject = `"\${WORKSPACE_PATH}/${r.slice(1, -1)}"`;
	return inject;
}
