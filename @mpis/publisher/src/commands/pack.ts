import { argv, CommandDefine, logger, type IArgDefineMap } from '@idlebox/cli';
import { shutdown } from '@idlebox/node';
import { recreateTempFolder } from '../common/constants.js';
import { execPnpmMute } from '../common/exec.js';
import { normalizeName } from '../common/path.js';
import { buildPackageTarball, extractPackage, getCurrentProject, reconfigurePackageJson } from '../common/shared-steps.js';

export class Command extends CommandDefine {
	protected override _usage: string = '';
	protected override _description: string = '重新打包当前项目，应用hook并输出tgz包';
	protected override _help: string = `
pack命令会执行以下步骤：
1. 运行build和打包
2. 解压缩到临时文件夹并运行hook
3. 清理package.json
4. 重新打包为tgz文件

`;
	protected override _arguments: IArgDefineMap = {
		'--out': { flag: false, usage: true, description: '输出文件名，支持%s（包名）和%v（版本号）变量，默认为%s-%v.tgz' },
	};
}

export async function main() {
	const out = argv.single(['--out']) || '%s-%v.tgz';

	if (argv.unused().length > 0) {
		throw new Error(`Unknown arguments: ${argv.unused().join(', ')}`);
	}

	// prepare
	await recreateTempFolder();
	const pkgJson = getCurrentProject();

	// 运行build、打包
	await buildPackageTarball();

	// 解压缩到临时文件夹，其中解压缩步骤会运行hook
	const extractDir = await extractPackage('hook-working-directory');

	// 简单清理
	reconfigurePackageJson(extractDir);

	// 重新运行pnpm pack
	const tgzFile = out.replace('%s', normalizeName(pkgJson.name)).replace('%v', pkgJson.version);
	await execPnpmMute(extractDir, ['pack', '--out', tgzFile]);
	logger.debug`已重新打包为 relative<${tgzFile}>`;

	// ok
	console.log(tgzFile);
	shutdown(0);
}
