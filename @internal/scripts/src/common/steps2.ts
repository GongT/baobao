import { raceTimeoutWithRetry } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { overrideImportFile } from '@idlebox/native-executer';
import { existsSync, shutdown } from '@idlebox/node';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getExportsField, packageJson } from './package-json.js';
import { currentProject } from './paths/current.js';
import { monorepoRoot } from './paths/root.js';

export async function executePrepublishHooks() {
	// 执行自定义的 prepublishHook: 钩子
	const hooks = Object.keys(packageJson['scripts'] || {}).filter((name) => name.startsWith('prepublishHook:'));
	if (hooks.length) {
		const entryFile = pathToFileURL(resolve(import.meta.dirname, 'exports.ts'));
		const hiddenFile = pathToFileURL(resolve(import.meta.dirname, '../exports.js'));
		overrideImportFile(hiddenFile, entryFile);
		for (const name of hooks) {
			const script = packageJson['scripts'][name];
			delete packageJson['scripts'][name];

			const absoluteFile = resolve(currentProject, script);
			if (!existsSync(absoluteFile)) {
				logger.error`预发布钩子脚本 ${name} 文件不存在！ (relative<${absoluteFile}>)`;
				shutdown(1);
			}

			logger.info`执行自定义 prepublishHook: 钩子 (${name} -> relative<${absoluteFile}>)`;
			await import(absoluteFile);
		}
	} else {
		logger.log`没有自定义 prepublishHook: 钩子`;
	}
}

async function writeLlmsFields(docUrl: string) {
	await writeFile(
		resolve(currentProject, 'llms.md'),
		`# ${packageJson.name}

This file is a pointer to the actual document URL.

The document is hosted on GitHub and can be accessed at the following URL:

> ${docUrl}

Document also available from context7 MCP.

`,
	);

	packageJson.llmsFull = docUrl;
	packageJson.llms = './llms.md';
	getExportsField()['./llms.txt'] = {
		default: './llms.md',
	};
}

export async function checkDocumentExists() {
	const packageName = encodeURIComponent(packageJson.name);
	const docUrl = `https://raw.githubusercontent.com/GongT/baobao/refs/heads/docs/${packageName}/llms.md`;
	const docFilePath = resolve(monorepoRoot, 'gh-docs', packageJson.name, 'llms.md');

	if (existsSync(docFilePath)) {
		logger.info`本地文档 relative<${docFilePath}> 已表明llms.md存在，跳过检查远程文档...`;
		await writeLlmsFields(docUrl);
		return;
	} else if (existsSync(resolve(monorepoRoot, 'gh-docs'))) {
		logger.info`本地文档目录存在，但 relative<${docFilePath}> 不存在，说明 llms.md 不存在，跳过检查远程文档...`;
		return;
	}

	logger.info`检查 llms.md 文档是否存在 [http_proxy=${process.env.http_proxy}]...`;
	const response = await raceTimeoutWithRetry(5000, 3, () => fetch(docUrl, { method: 'HEAD' }));
	if (response.status === 404) {
		logger.info`llms.md 文档不存在`;
		return;
	} else if (!response.ok) {
		logger.error`检查 llms.md 文档时发生错误: ${response.status} ${response.statusText}`;
		shutdown(1);
	}

	logger.success`文档 llms.md 存在！`;

	await writeLlmsFields(docUrl);
}
