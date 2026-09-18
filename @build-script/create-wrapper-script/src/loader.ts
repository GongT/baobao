import { createArgsReader } from '@idlebox/args';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { defaultWriteFile, writeInteractive } from './common/safe.js';
import { createWrapperScript } from './create-wrap-script.js';

const args = createArgsReader(process.argv.slice(2));

const targetIsFile = args.flag(['-T']) > 0;
const forceOverride = args.flag(['--force']) > 0;

const workspace = args.single(['--workspace']);
let targetFile = args.at(0);
if (!targetFile) {
	usage('缺少目标文件路径参数');
}
targetFile = resolve(process.cwd(), targetFile);
if (!existsSync(targetFile)) {
	usage(`目标文件不存在: ${targetFile}`);
}

let wrapperFile = args.at(1);
if (!wrapperFile) {
	usage('缺少包装文件路径参数');
}
wrapperFile = resolve(process.cwd(), wrapperFile);
if (existsSync(wrapperFile)) {
	if (statSync(wrapperFile).isDirectory()) {
		if (targetIsFile) {
			usage(`目标文件必须是文件，不能是目录: ${wrapperFile}`);
		}
		wrapperFile = resolve(wrapperFile, basename(targetFile, extname(targetFile)));
	}
}

if (args.unused().length) {
	usage(`未使用的参数: ${args.unused().join(' ')}`);
}

console.log(`创建包装脚本: ${wrapperFile} -> ${targetFile}`);

mkdirSync(resolve(wrapperFile, '..'), { recursive: true });

await createWrapperScript({
	targetFile,
	wrapperFile,
	workspace,
	writeFile: forceOverride ? defaultWriteFile : writeInteractive,
});

function usage(message: string): never {
	console.error(message);
	console.error('用法: create-wrapper-script [--workspace <workspace>] [-T] <targetFile> <wrapperFile>');
	process.exit(1);
}
