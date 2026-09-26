import { open } from 'node:fs/promises';

let currentWorking: string | undefined;
const githubSummaryFile = process.env.GITHUB_STEP_SUMMARY || '';

export function setCurrentWorking(message: string) {
	if (currentWorking) throw new Error(`setCurrentWorking: 重复调用，当前值为 ${currentWorking}`);
	currentWorking = message;
}

interface IPrinter {
	(message: string): void;
}

export async function printSummaryError(callback: (printer: IPrinter) => void) {
	if (!githubSummaryFile) return;

	await using fd = await open(githubSummaryFile, 'a');
	if (currentWorking) {
		fd.write(`# 任务"${currentWorking}"失败\n`);
	}

	callback((message: string) => fd.write(`${message}\n`));
}
