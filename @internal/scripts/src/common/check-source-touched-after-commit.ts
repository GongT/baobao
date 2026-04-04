import { logger } from '@idlebox/logger';
import { execa } from 'execa';
import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { monorepoRoot } from './paths/root.js';

const seps = /[\\/]/g;
const commitIdRegex = /<!--\s*commit:\s*([^\s]+)\s*-->/i;
const extensions = /\.[^/.\\]+$/;

export function getDocFilePath(sourceFilePath: string, overridePackageName?: string): string {
	if (!isAbsolute(sourceFilePath)) sourceFilePath = resolve(process.cwd(), sourceFilePath);

	const relativePath = relative(monorepoRoot, sourceFilePath);

	const parts = relativePath.split(seps);
	let packageName = '';
	if (relativePath.startsWith('@')) {
		packageName = parts.splice(0, 2).join('/');
	} else {
		packageName = `standalone/${parts[0]}`;
		parts.shift();
	}
	if (overridePackageName) {
		packageName = overridePackageName;
	}
	assert.equal(parts.shift(), 'src', 'Source file should be under src directory');
	const srcPath = parts.join('/');

	return resolve(monorepoRoot, 'gh-docs', packageName, srcPath.replace(extensions, '.md'));
}

/**
 * Check if a source code file has been modified after the commit ID specified in its corresponding documentation file.
 *
 * @param sourceFilePath - The path to the source code file
 * @returns true if the source file was touched after the commit ID in the documentation file, false otherwise
 */
export async function checkSourceTouchedAfterCommit(sourceFilePath: string, overrideDocPath?: string): Promise<boolean> {
	try {
		// Calculate document file path: remove 'src/', prepend 'gh-docs/', replace extension with '.md'
		const docFilePath = overrideDocPath ?? getDocFilePath(sourceFilePath);

		if (isAbsolute(sourceFilePath)) sourceFilePath = relative(monorepoRoot, sourceFilePath);

		// Read the document file
		if (!existsSync(docFilePath)) {
			logger.warn`文档文件不存在: ${docFilePath}`;
			return true;
		}

		const docContent = readFileSync(docFilePath, 'utf8');

		// Find commit ID from <!-- commit:xxx -->
		const commitMatch = docContent.match(commitIdRegex);
		if (!commitMatch || !commitMatch[1]) {
			logger.warn`文档文件中未找到 Commit ID: ${docFilePath}`;
			return true;
		}

		const commitId = commitMatch[1];

		// Execute git command to check if source file was touched after this commit
		// Use git log to see if there are commits affecting the source file after the given commit
		const result = await execa('git', ['log', '--oneline', '--format=%H', `${commitId}..HEAD`, '--', sourceFilePath], {
			reject: false,
		});

		if (result.failed) {
			logger.error`Git 命令失败: ${sourceFilePath}: ${result.stderr}`;
			throw new Error(`Git 命令失败: ${result.stderr}`);
		}

		// If there's output, it means the file was touched after the commit
		return result.stdout.trim() !== '';
	} catch (error) {
		logger.error`检查源文件 ${sourceFilePath} 时出错: ${error}`;
		throw error;
	}
}
