/// <reference types="node" />

import debug from 'debug';
import assert from 'node:assert';
import { existsSync, realpathSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { findPackageJSON } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { distResolver, make } from './config.js';

const log = debug('executer:e:build');
const logCi = debug('ci:executer');

export const resolveOutput = await main();

async function generateOutDir() {
	const packageJsonPath = findoutBinaryPackage();
	const { default: packageJson } = await import(packageJsonPath, { with: { type: 'json' } });
	assert.ok(packageJson.name, `包 ${packageJsonPath} 缺少name字段`);
	const outId = packageJson.name.replace(/^@/, '').replace(/\//g, '-');

	return `.JIT/${outId}`;
}

function findoutBinaryPackage() {
	const scriptPath = process.argv[1];
	assert.ok(scriptPath, `命令行异常: ${process.argv.join(' ')}`);
	let whoAmI;
	try {
		whoAmI = realpathSync(scriptPath);
	} catch {
		throw new Error(`命令行中的脚本实际不存在: ${scriptPath}`);
	}
	const packageJsonPath = findPackageJSON(pathToFileURL(whoAmI));
	if (!packageJsonPath) {
		throw new Error(`无法找到所在包路径: ${whoAmI}`);
	}
	return packageJsonPath;
}

async function main() {
	const outPath = await generateOutDir();
	const outRoot = distResolver(outPath)();
	const signalFile = resolve(outRoot, '_success_signal_');

	logCi(`需要通过native-executer构建并加载自身`);
	await mkdir(outRoot, { recursive: true });

	// TODO lock

	log(`成功获取锁`);

	if (existsSync(signalFile)) {
		if (process.env.__RELAUNCH__) {
			log(`输出文件存在，重新启动状态跳过重生成`);
		} else if (process.env.CI) {
			log(`CI环境，跳过重生成`);
		} else {
			log(`输出文件存在: ${signalFile} (开发模式强制重新生成)`);
			await make(outPath);
			writeFileSync(signalFile, new Date().toISOString());
		}
	} else {
		log(`输出文件不存在，需要构建`);
		logCi(`输出文件不存在，需要构建`);
		await make(outPath);
		writeFileSync(signalFile, new Date().toISOString());
	}

	return (...components) => {
		return resolve(outRoot, ...components);
	};
}
