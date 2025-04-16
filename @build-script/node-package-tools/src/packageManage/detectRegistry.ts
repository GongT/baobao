import { convertCatchedError } from '@idlebox/common';
import { PathEnvironment, commandInPath } from '@idlebox/node';
import { execaCommand } from 'execa';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { errorLog, log } from '../inc/log';

let foundPm: string;

export async function getPackageManager() {
	if (foundPm) {
		return foundPm;
	}
	for (const name of ['pnpm', 'yarn', 'npm']) {
		if (await commandInPath(name).catch(() => false)) {
			return (foundPm = name);
		}
	}

	const pathVar = new PathEnvironment();
	console.log('当前PATH: (' + process.env.PATH + ')\n  - ' + [...pathVar.values()].join('\n  - '));
	throw new Error('未检测到任何包管理器，请在PATH中安装npm/yarn/pnpm');
}

export async function detectRegistry(url: string, currentProjectPath: string): Promise<string> {
	if (url !== 'detect') {
		log('使用命令行提供的registry地址 (%s)', url);

		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url.replace(/\/+$/, '');
		}

		errorLog('[!!] 参数无效: --registry: 必须以http:或https:开头');
		process.exit(1);
	}

	try {
		url = await resolveRegistry(currentProjectPath);
	} catch (e) {
		log('    [!!] 执行config get时出错: %s', convertCatchedError(e).message);
	}
	if (url) {
		const u = new URL(url);
		if (!u.protocol || !u.host) {
			errorLog('[!!] 配置无效 (registry=%s): url格式不正确', url);
			process.exit(1);
		}

		url = url.replace(/\/+$/, '');
		log('使用配置文件中的registry地址 (%s)', url);
		return url;
	} else {
		url = 'https://registry.npmjs.org';
		log('使用默认的registry地址 (%s)', url);
		return url;
	}
}

async function resolveRegistry(path: string) {
	let url: string;
	const pm = await getPackageManager();
	log('使用的包管理器: %s', pm);

	const pkgJson = JSON.parse(await readFile(resolve(path, 'package.json'), 'utf-8'));
	const scope = pkgJson.name.startsWith('@') ? pkgJson.name.replace(/\/.+$/, '') : '';
	log('    package scope: %s', scope);
	if (scope) {
		url = (await execaCommand(pm + ' config get ' + scope + ':registry', { stderr: 'ignore', cwd: path })).stdout;
		log('    获取配置的registry (scope): %s', url);
		if (url !== 'undefined') {
			return url.trim();
		}
	}

	url = (await execaCommand(pm + ' config get registry', { stderr: 'ignore', cwd: path })).stdout;
	log('    获取配置的registry: %s', url);

	return url.trim();
}
