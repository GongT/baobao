/// <reference types="node" />

import debug from 'debug';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import lockfile from 'proper-lockfile';
import { make, outDir, outFile } from './config.js';

const log = debug('executer:early-load');
const logCi = debug('ci:executer:early-load');

await main();

async function main() {
	logCi(`需要通过native-executer构建并加载自身`);
	await mkdir(outDir, { recursive: true });

	const release = await lockfile.lock(outDir, {
		retries: {
			factor: 1,
		},
	});

	logCi(`成功获取锁`);

	try {
		if (existsSync(outFile)) {
			if (process.env.__RELAUNCH__) {
				log(`输出文件存在，重新启动状态跳过重生成`);
				return;
			} else if (process.env.CI) {
				log(`CI环境，跳过重生成`);
				return;
			} else {
				log(`输出文件存在: ${outFile} (开发模式强制重新生成)`);
			}
		} else {
			logCi(`输出文件不存在，需要构建`);
		}

		await make();
	} finally {
		await release();
	}
}
