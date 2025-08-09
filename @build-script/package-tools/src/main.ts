import { makeApplication, type ArgDefineMap } from '@idlebox/cli';
import { setExitCodeIfNot } from '@idlebox/node';
import { basename } from 'node:path';
import pkgJson from '../package.json' with { type: 'json' };
import { cli_commands, cli_imports } from './commands.generated.js';

export const common_args: ArgDefineMap = {
	'--registry': { flag: false, description: 'npm服务器，默认从.npmrc读取(必须有schema://)' },
	'--dist-tag': { flag: false, description: '需要从服务器读取时使用的tag，默认为"latest"' },
	'--package': { flag: false, description: '实际操作前，更改当前目录（此文件夹应包含package.json）' },
};

setExitCodeIfNot(0);
await makeApplication({
	name: basename(pkgJson.name),
	description: pkgJson.description,
	logPrefix: process.env.LOGGER_PREFIX || '',
})
	.withCommon(common_args)
	.static(cli_imports, cli_commands);

// await makeApplication()
// 	.withCommon(common_args)
// 	.dynamic(resolve(import.meta.dirname, 'commands'), '*.js');
