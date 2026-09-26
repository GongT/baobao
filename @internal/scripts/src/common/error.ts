import { logger } from '@idlebox/logger';
import { appendFileSync } from 'node:fs';

const githubSummaryFile = process.env.GITHUB_STEP_SUMMARY || '';

export function printError(message: TemplateStringsArray, ...values: any[]) {
	logger.error(message, ...values);
	if (githubSummaryFile) {
		appendFileSync(githubSummaryFile, `# 项目管理脚本运行失败\n错误信息: ${String.raw(message, ...values)}\n\n`);
	}
}
export function printDetails(content: string) {
	content = content.trim();
	const lines = content.split('\n');
	for (const line of lines) {
		logger.warn(line);
	}
	if (githubSummaryFile) {
		appendFileSync(githubSummaryFile, `<pre>${content}</pre>\n\n`);
	}
}
