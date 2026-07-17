import { createWorkspace, PackageManagerKind } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import { relativePath } from '@idlebox/node';
import { execa } from 'execa';
import { existsSync } from 'node:fs';
import { chmod, cp, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { loadYaml } from '../common/functions/yaml-tool.js';

export class Command extends CommandDefine {
	protected override readonly _usage = '';
	protected override readonly _description = '创建pnpm monorepo的构建缓存，用于在docker中加速构建';
	protected override readonly _help = '';
	protected override readonly _arguments = {
		'--print': { usage: true, flag: true, description: '输出相关文件的路径' },
		'--dist': { usage: true, flag: false, description: '将相关文件复制到指定目录' },
		'--tarball': { usage: true, flag: true, description: '打包为tar, --dist改为指定此文件的路径' },
		'--force': { usage: true, flag: true, description: '强制覆盖目标文件、目录' },
	};
}

export async function main() {
	const distPath = argv.single(['--dist']);
	const isPrint = argv.flag(['--print']) > 0 || !distPath;
	const isTarball = argv.flag(['--tarball']) > 0;
	const isForce = argv.flag(['--force']) > 0;
	if (isTarball && !distPath) {
		throw new Error(`--tarball 时必须指定 --dist`);
	}

	const workspace = await createWorkspace();

	if (workspace.packageManagerKind !== PackageManagerKind.PNPM) {
		logger.warn`当前目录似乎不是pnpm工作区，结果可能不准确`;
	}

	const packages = await workspace.listPackages();

	const files = new FileCollection(workspace.root);
	const placeholders = new FileCollection(workspace.root);

	for (const item of ['.pnpmfile.mjs', '.pnpmfile.cjs', '.pnpmfile.js']) {
		const added = files.add(item);
		if (added) break;
	}

	for (const item of ['pnpm-lock.yaml', 'pnpm-workspace.yaml']) {
		const added = files.add(item);
		if (!added) throw new Error(`文件不存在: ${item}`);
	}
	for (const item of ['.npmrc']) {
		files.add(item);
	}

	for (const pkg of packages) {
		for (const item of ['.npmrc']) {
			files.add(`${pkg.relative}/${item}`);
		}

		for (const item of ['package.yaml', 'package.json']) {
			const added = files.add(`${pkg.relative}/${item}`);
			if (added) {
				if (typeof pkg.packageJson.bin === 'string') {
					placeholders.add(`${pkg.relative}/${pkg.packageJson.bin}`);
				} else if (typeof pkg.packageJson.bin === 'object') {
					for (const binPath of Object.values(pkg.packageJson.bin)) {
						placeholders.add(`${pkg.relative}/${binPath}`);
					}
				}

				if (pkg.packageJson?.scripts?.postinstall) {
					logger.warn`包 ${pkg.relative} 中存在 postinstall 脚本，可能会在安装时报错`;
				}

				break;
			}
		}
	}

	const workspaceConfig = await loadYaml(resolve(workspace.root, 'pnpm-workspace.yaml'));

	for (const patchFile of Object.values(workspaceConfig.patchedDependencies ?? {})) {
		files.add(patchFile as string);
	}

	if (isPrint) {
		for (const file of files.items()) {
			console.log(file);
		}
	}

	if (distPath) {
		const distAbs = resolve(process.cwd(), distPath);
		if (distAbs === workspace.root) {
			throw new Error(`--dist 不能指定为当前工作区的根目录`);
		}
		if (!isForce && existsSync(distAbs)) {
			throw new Error(`目标文件或目录已存在: ${distAbs}`);
		}

		if (isTarball) {
			logger.info`打包${files.size}个文件为tarball: ${distAbs}`;
			await mkdir(dirname(distAbs), { recursive: true });
			await execa({
				input: files.items().join('\n'),
				stdout: 'inherit',
				stderr: 'inherit',
			})`tar -cf ${distAbs} -T -`;
		} else {
			logger.info`复制${files.size}个文件到目录: ${distAbs}`;
			for (const file of files.items()) {
				const src = resolve(workspace.root, file);
				const dst = resolve(distAbs, file);
				await mkdir(dirname(dst), { recursive: true });
				await cp(src, dst);
			}

			for (const file of placeholders.items()) {
				const dst = resolve(distAbs, file);
				await mkdir(dirname(dst), { recursive: true });
				await writeFile(dst, '#!/usr/bin/bash\necho "占位文件禁止运行"\nexit 1');
				await chmod(dst, 0o755);
			}
		}
	}
}

class FileCollection {
	private readonly files = new Set<string>();

	constructor(private readonly root: string) {}

	public add(file: string) {
		const abs = resolve(this.root, file);
		if (existsSync(abs)) {
			logger.verbose`添加文件 ${file}`;
			this.files.add(relativePath(this.root, abs));
			return true;
		} else {
			logger.verbose`文件 ${file} 不存在，跳过`;
			return false;
		}
	}

	public items() {
		return Array.from(this.files);
	}

	get size() {
		return this.files.size;
	}
}
