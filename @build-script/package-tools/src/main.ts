import { makeApplication, type ArgDefineMap } from '@idlebox/cli';
import { cli_commands, cli_imports } from './commands.generated.js';

export const common_args: ArgDefineMap = {
	'--registry': { flag: false, description: 'npm服务器，默认从.npmrc读取(必须有schema://)' },
	'--dist-tag': { flag: false, description: '需要从服务器读取时使用的tag，默认为"latest"' },
	'--package': { flag: false, description: '实际操作前，更改当前目录（此文件夹应包含package.json）' },
	'--json': { flag: true, description: '输出json格式（部分命令支持）' },
};

await makeApplication().withCommon(common_args).static(cli_imports, cli_commands);

// await makeApplication()
// 	.withCommon(common_args)
// 	.dynamic(resolve(import.meta.dirname, 'commands'), '*.js');
