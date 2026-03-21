import { execa } from 'execa';
import { monorepoRoot } from './common/paths/root.js';

interface Run {
	databaseId: number;
	conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | 'stale' | 'startup_failure';
	status:
		| 'queued'
		| 'completed'
		| 'in_progress'
		| 'requested'
		| 'waiting'
		| 'pending'
		| 'action_required'
		| 'cancelled'
		| 'failure'
		| 'neutral'
		| 'skipped'
		| 'stale'
		| 'startup_failure'
		| 'success'
		| 'timed_out';
	url: string;
	startedAt: string;
	updatedAt: string;
}

const spawn = execa({
	stdin: 'ignore',
	stdout: 'pipe',
	stderr: 'inherit',
	encoding: 'utf8',
	cwd: monorepoRoot,
});

async function getRuns() {
	const result = await spawn`gh run list --workflow=release.yml --json databaseId,status,conclusion,url,startedAt,updatedAt`;
	return JSON.parse(result.stdout) as Array<Run>;
}

console.log('正在检查运行中的任务...');
const runs = await getRuns();

const running = runs.filter((run) => run.status === 'in_progress');

if (running.length > 0) {
	console.log('运行中的任务: %s', running[0].url);
	process.exit(1);
}

if (runs.length > 0) {
	console.log('最近的任务: %s (%s)', runs[0].url, runs[0].conclusion);
}

console.log('没有运行中的任务，继续发布流程。');
await spawn`gh workflow run release.yml --json`;

console.log('已启动！');
const runs2 = await getRuns();

const running2 = runs2.filter((run) => run.status === 'in_progress');
if (running2.length > 0) {
	console.log('运行中的任务: %s', running2[0].url);
} else {
	console.log('没有运行中的任务，可能是启动失败了，请检查！');
}
