import { findUp, findUpSync, findUpUntil, findUpUntilSync } from '@idlebox/node';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * 寻找 monorepo 根目录
 *
 * @param currentDirectory
 * @param boundary 最外层目录，默认为.git所在目录
 * @return 返回**定义文件**（例如 pnpm-workspace.yaml文件）的路径，不是目录本身
 */
export async function findMonorepoRoot(currentDirectory: string, boundary: string = ''): Promise<string | null> {
	if (!boundary) {
		const gitdir = await findUpUntil({ from: currentDirectory, file: ['.git'] });
		if (gitdir) {
			boundary = dirname(gitdir);
		}
	}

	const file = await findUpUntil({
		file: ['pnpm-workspace.yaml', 'lerna.json', 'rush.json'],
		from: currentDirectory,
		top: boundary,
	});
	if (file) {
		return file;
	}

	const iter = findUp({
		file: ['package.json'],
		from: currentDirectory,
		top: boundary,
	});

	for await (const file of iter) {
		try {
			const content = JSON.parse(await readFile(file, 'utf-8'));
			if (content.workspaces) {
				return file;
			}
		} catch {}
	}
	return null;
}

/**
 * 寻找 monorepo 根目录
 *
 * @param currentDirectory
 * @param boundary 最外层目录，默认为.git所在目录
 * @return 返回**定义文件**（例如 pnpm-workspace.yaml文件）的路径，不是目录本身
 */
export function findMonorepoRootSync(currentDirectory: string, boundary: string = ''): string | null {
	if (!boundary) {
		const gitdir = findUpUntilSync({ from: currentDirectory, file: ['.git'] });
		if (gitdir) {
			boundary = dirname(gitdir);
		}
	}

	const file = findUpUntilSync({
		file: ['pnpm-workspace.yaml', 'lerna.json', 'rush.json'],
		from: currentDirectory,
		top: boundary,
	});
	if (file) {
		return file;
	}

	const files = findUpSync({
		file: ['package.json'],
		from: currentDirectory,
		top: boundary,
	});

	for (const file of files) {
		if (file.endsWith('.git')) {
			break;
		}
		try {
			const content = JSON.parse(readFileSync(file, 'utf-8'));
			if (content.workspaces) {
				return file;
			}
		} catch {}
	}
	return null;
}
