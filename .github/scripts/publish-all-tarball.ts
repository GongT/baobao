import { execa } from 'execa';
import { appendFileSync, globSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { chdir } from 'node:process';
import { Writable } from 'node:stream';

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const logFileMatcher = /A complete log of this run can be found in:(.+)$/gm;

function appendSummary(content: string) {
	if (!summaryPath) return;
	appendFileSync(summaryPath, content);
}

chdir('.package-tools/publish');

async function main() {
	const files = globSync('**/*.tgz');

	appendSummary('\n## 发布包\n');

	let notOk = 0;
	for (const item of files) {
		const ok = await publishItem(item);
		if (!ok) notOk++;
	}

	appendSummary(`\n## 发布结果\n失败数量: ${notOk}\n`);
	if (notOk === 0) {
		console.log('所有包发布成功 🎉');
	} else {
		console.log('有 %d 个包发布失败 ❌', notOk);
	}
	return notOk;
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

async function publishItem(item: string) {
	console.log('::group::发布文件 %s ...', item);

	const pkgName = basename(item, '.tgz');

	const p = execa({
		reject: false,
		stdin: 'ignore',
		stdout: 'pipe',
		stderr: 'pipe',
		all: true,
		encoding: 'utf8',
	})`npm publish --access public --tag latest ${item}`;

	p.all.pipe(process.stderr);
	const output = p.all.pipe(new CollectingStream());

	const res = await p;

	console.log('程序退出，返回 %d', res.exitCode);
	console.log('::endgroup::');

	if (res.exitCode === 0) {
		return true;
	}

	appendSummary(`* ${pkgName} 失败`);
	console.log('::error title=%s 发布失败::%s\n', pkgName, `npm publish 返回 ${res.exitCode}`);

	const outputStr = output.getOutput();
	const match = logFileMatcher.exec(outputStr);
	if (match) {
		const logFilePath = match[1].trim();

		console.log('::group::     详细输出信息 (%s)', logFilePath);
		try {
			const content = readFileSync(logFilePath, 'utf-8');
			console.log(content);
		} catch (e) {
			console.log('无法读取日志文件: %s', e);
		}
		console.log('::endgroup::');
	} else {
		console.log(`似乎不是npm问题，无法确定错误原因`);
	}
	return false;
}

main()
	.then((code) => {
		process.exit(code);
	})
	.catch((e) => {
		console.error('发布过程中发生错误: %s', e);
		process.exit(1);
	});
