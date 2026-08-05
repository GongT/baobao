import { makeApplication, type IArgDefineMap } from '@idlebox/cli';
import { setExitCodeIfNot } from '@idlebox/node';
import { basename, resolve } from 'node:path';
import pkgJson from '../package.json' with { type: 'json' };
import { cli_commands, cli_imports } from './commands.generated.js';

export const common_args: IArgDefineMap = {
	'--registry': { flag: false, description: 'npm服务器，默认从.npmrc读取(必须有schema://)' },
	'--dist-tag': { flag: false, description: '需要从服务器读取时使用的tag，默认为"latest"' },
	'--package': { flag: false, description: '实际操作前，更改当前目录（此文件夹应包含package.json）' },
};

setExitCodeIfNot(0);
const cli = makeApplication({
	name: basename(pkgJson.name),
	description: pkgJson.description,
	logPrefix: process.env.LOGGER_PREFIX || '',
});
cli.withCommon(common_args);

export async function main_static() {
	await cli.static(cli_imports, cli_commands);
}

export async function main_dynamic() {
	await cli.dynamic(resolve(import.meta.dirname, 'commands'), ['*.js', '*.ts']);
}
