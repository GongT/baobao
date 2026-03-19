import { execa } from 'execa';
import { appendFileSync, globSync, readFileSync } from 'node:fs';
import { copyFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chdir } from 'node:process';
import { Writable } from 'node:stream';

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const logFileMatcher = /A complete log of this run can be found in:(.+)$/gm;
const cnpmSyncWaitList: Promise<any>[] = [];
const SP = {
	Publish: 0,
	Result: 1,
	CNpm: 2,
} as const;
const postSummary: string[][] = [];
const cnpmBin = process.env.CNPM_BIN;
let postOutput = '';

summary(SP.CNpm, '# cnpm同步');
if (!cnpmBin) {
	summary(SP.CNpm, '未找到cnpm，跳过同步');
	postOutput += '未找到cnpm，跳过同步\n';
}

function summary(id: number, content: string) {
	if (!postSummary[id]) {
		postSummary[id] = [];
	}

	if (content.startsWith('#')) {
		postSummary[id].push('\n');
	}
	postSummary[id].push(content);
}

async function main() {
	chdir('.package-tools/publish');

	process.env.LC_ALL = 'C.UTF-8';

	console.log('::group::运行环境');
	console.log('当前目录: %s', process.cwd());
	console.log('环境变量: %o', process.env);
	console.log('::endgroup::');

	const files = globSync('**/*.tgz');

	summary(SP.Publish, `## 发布 ${files.length} 个包`);
	summary(SP.Result, `## 发布结果`);

	let notOk = 0;
	for (const item of files) {
		const ok = await publishItem(item);
		if (!ok) notOk++;
	}

	summary(SP.Result, `\n失败数量: ${notOk}`);
	if (notOk === 0) {
		console.log('所有包发布成功 🎉');
	} else {
		console.log('有 %d 个包发布失败 ❌', notOk);
	}

	await Promise.race([Promise.allSettled(cnpmSyncWaitList), sleep(5000)]);
	console.log('cnpm同步已发出');

	return notOk;
}

async function syncCnpm(name: string) {
	if (!cnpmBin) return;

	const r = await execa({
		stdio: 'pipe',
		reject: false,
		all: true,
	})`${cnpmBin} sync ${name}`;

	if (r.exitCode === 0) {
		summary(SP.CNpm, `* 同步成功: ${name}`);
	} else {
		summary(SP.CNpm, `* 同步出错: ${name}`);
		postOutput += `::group::cnpm 同步 ${name} 失败\n${r.all.trim()}\n::endgroup::\n`;
	}
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export class CollectingStream extends Writable {
	private buffer = '';

	constructor() {
		super({ objectMode: true });
	}

	override _write(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
		this.buffer += chunk.toString('utf8');
		callback();
	}

	getOutput() {
		return this.buffer;
	}
}

async function runOnce(file: string, isFirstAttempt: boolean) {
	const tmpDir = await mkdtemp(join(tmpdir(), 'publish-tmp-'));
	console.log('解压文件 %s 到临时目录 %s', file, tmpDir);

	await execa({
		reject: true,
		stdio: 'inherit',
	})`tar -xf ${file} -C ${tmpDir}`;
	await copyFile('.npmrc', join(tmpDir, '.npmrc'));

	const pkgTxt = readFileSync(join(tmpDir, 'package', 'package.json'), 'utf-8');
	const pkgJson = JSON.parse(pkgTxt);

	console.log('包名: %s\n版本: %s\nURL: https://www.npmjs.com/package/%s', pkgJson.name, pkgJson.version, pkgJson.name);

	const p = execa({
		reject: false,
		stdin: 'ignore',
		stdout: 'pipe',
		stderr: 'pipe',
		all: true,
		encoding: 'utf8',
		cwd: join(tmpDir, 'package'),
	})`npm publish --access public --tag latest`;

	p.all.pipe(process.stderr, { end: false });
	const output = p.all.pipe(new CollectingStream(), { end: true });

	const res = await p;

	await rm(tmpDir, { force: true, recursive: true }).catch((e) => {
		console.error('删除临时目录失败', e.message);
	});

	console.log('程序退出，返回 %d', res.exitCode);

	if (res.exitCode === 0) {
		cnpmSyncWaitList.push(syncCnpm(pkgJson.name));

		summary(SP.Publish, `* ✅ 成功: ${pkgJson.name} @ v${pkgJson.version}`);
		return { success: true, debugInfo: '', output: output.getOutput() };
	}

	if (isFirstAttempt) {
		summary(SP.Publish, `* ❌ 失败: ${pkgJson.name} @ v${pkgJson.version}`);
	}
	console.log('::error title=%s @ v%s 发布失败::%s\n', pkgJson.name, pkgJson.version, `npm publish 返回 ${res.exitCode}`);

	let debugInfo = '---------- package.json:';
	debugInfo += pkgTxt.trim();
	debugInfo += '\n';

	return { success: false, debugInfo, output: output.getOutput() };
}

async function publishItem(item: string) {
	let success = false;
	let output = '';
	let debugInfo = '';
	for (let i = 0; i < 5; i++) {
		const isretry = i > 0 ? `[第${i}次重试]` : '';
		console.log('::group::%s发布文件 %s ...', isretry, item);
		const r = await runOnce(item, i === 0);
		console.log('::endgroup::');

		success = r.success;
		output = r.output;
		debugInfo = r.debugInfo;
		if (success) {
			return true;
		}

		// TODO: 重复版本号错误
	}

	summary(SP.Result, `* ${item}`);

	const match = logFileMatcher.exec(output);
	console.log('::group::     详细信息');

	console.log(debugInfo);

	if (match) {
		const logFilePath = match[1].trim();

		try {
			const content = readFileSync(logFilePath, 'utf-8');
			console.log('---------- 日志文件 (%s)', logFilePath);
			console.log(content);
		} catch (e) {
			console.log('无法读取日志文件: %s', e);
		}
	} else {
		console.log(`似乎不是npm问题，无法确定错误原因`);
	}
	console.log('::endgroup::');
	return success;
}

function addPostSummary() {
	if (!summaryPath) return;

	let content = '';
	for (const lines of postSummary) {
		if (!lines || lines.length === 0) continue;
		content += lines.join('\n');
		content += '\n';
	}
	appendFileSync(summaryPath, content);
}

main()
	.catch((e) => {
		console.error('发布过程中发生错误: %s', e);
		console.log('::error title=发布过程中发生错误::%s\n', e.message);
		return 1;
	})
	.then((rCode) => {
		console.error(postOutput);
		addPostSummary();
		process.exit(rCode);
	});
