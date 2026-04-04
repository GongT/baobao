import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { execa } from 'execa';
import { readdir, rm } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import process from 'node:process';
import { checkSourceTouchedAfterCommit, getDocFilePath } from '../common/check-source-touched-after-commit.js';
import { monorepoRoot } from '../common/paths/root.js';

const packagePaths = argv.range(0);
const dryRun = argv.flag(['--dry']) > 0;

if (packagePaths.length === 0) {
	console.error('[list-outdated-source] 用法: list-outdated-source <...package-path>');
	process.exit(1);
}

const docFilePaths = new Set<string>();
const outdatedSources = new Map<string, string>(); // source file path -> doc file path

const primaryPackage = packagePaths[0];
const ghDocsDir = resolve(monorepoRoot, 'gh-docs', primaryPackage);

for (const pkgPath of packagePaths) {
	await work(pkgPath);
}

await cleanOutdatedDocs();

logger.info`共 ${outdatedSources.size} 个文件需要更新文档`;

if (outdatedSources.size) {
	for (const [file, docPath] of outdatedSources) {
		const mapped = docPath.replace('.generator.', '.').replace('.generated.', '.');
		console.log('%s -> %s', file, mapped);
	}
}

shutdown(0);

async function work(rawPackagePath: string) {
	const packagePath = isAbsolute(rawPackagePath) ? rawPackagePath : resolve(monorepoRoot, rawPackagePath);

	const relPkgPath = relative(monorepoRoot, packagePath);
	const packageName = relPkgPath.startsWith('@') ? relPkgPath : `standalone/${relPkgPath}`;

	logger.debug`packagePath: ${packagePath}`;
	logger.debug`packageName: ${packageName}`;

	const lsResult = await execa('git', ['ls-files', 'src/'], { cwd: packagePath, reject: false });
	if (lsResult.failed) {
		console.error('[list-outdated-source] git ls-files 失败: %s', lsResult.stderr);
		shutdown(1);
	}

	const srcFiles = lsResult.stdout
		.split('\n')
		.filter(Boolean)
		.map((f) => resolve(packagePath, f));

	logger.debug`找到 ${srcFiles.length} 个源文件`;

	for (const file of srcFiles) {
		const docPath = getDocFilePath(file, primaryPackage);
		docFilePaths.add(docPath);

		const touched = await checkSourceTouchedAfterCommit(file, docPath);
		if (touched) {
			outdatedSources.set(file, docPath);
		}
	}
}

async function cleanOutdatedDocs() {
	async function walkAndClean(dir: string): Promise<void> {
		let entries;
		try {
			entries = await readdir(dir, { withFileTypes: true });
		} catch (e) {
			if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
				logger.debug`目录不存在: ${dir}`;
				return;
			}
			throw e;
		}

		for (const entry of entries) {
			const fullPath = resolve(dir, entry.name);
			logger.verbose`处理路径: ${fullPath}`;
			if (entry.isDirectory()) {
				await walkAndClean(fullPath);
			} else if (entry.isFile()) {
				if (entry.name === 'llms.md') continue;
				if (!docFilePaths.has(fullPath)) {
					logger.warn`删除孤立文档: ${fullPath}`;
					if (!dryRun) {
						await rm(fullPath);
					}
				}
			}
		}
	}

	logger.info`正在清理孤立文档...`;
	await walkAndClean(ghDocsDir);
}
