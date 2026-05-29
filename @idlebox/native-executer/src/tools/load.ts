import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import type { LoadFnOutput, LoadHookContext, LoadHookSync } from 'node:module';
import { fileURLToPath } from 'node:url';
import { theState } from './global.js';
import { sizeOf } from './share.js';
import { log, runPrefixFile, type NextLoad } from './types.js';

const firstLine = /^.+\n/;
const eachLineStart = /^/gm;
const hiddenChars = /[\x00-\x1F\x7F-\x9F]/g;

function myLoad(url: string, context: LoadHookContext, defaultLoad: NextLoad): LoadFnOutput {
	if (url.endsWith('#generate')) {
		return loadGenerate(url);
	} else {
		if (theState.loaded) {
			if (url.startsWith('file://')) {
				theState.loaded.add(url);
			} else {
				console.error(`遇到了意外的非文件URL: ${url}`);
			}
		}
	}
	return defaultLoad(url, context);
}

function loadGenerate(url: string): LoadFnOutput {
	log.generate('执行生成器"%s"', url);
	url = url.slice(0, -9);

	theState.loaded?.add(url);

	const protocolMagic = randomUUID();
	const nodeVer = Number(process.versions.node.split('.')[0]);
	const nodeArgs = ['--import', runPrefixFile];
	if (nodeVer < 26) {
		nodeArgs.unshift('');
	}
	const p = spawnSync(process.execPath, [...nodeArgs, fileURLToPath(url)], {
		stdio: ['ignore', 'pipe', 'pipe'],
		maxBuffer: 10 * 1024 * 1024,
		encoding: 'utf8',
		shell: false,
		env: {
			...process.env,
			PROTOCOL_MAGIC: protocolMagic,
			NODE_OPTIONS: '',
		},
	});

	// if (log.generate.enabled) {
	// 	verboseLines.push(`[GENERATE] ${url}`);
	// 	verboseLines.push(`${context.format}`);
	// 	verboseLines.push(`conditions: [${context.conditions?.join(', ') ?? 'no conditions'}]`);
	// 	verboseLines.push(`stdout=============================\n${p.stdout}\n=============================`);
	// 	verboseLines.push(`stderr=============================\n${p.stderr}\n=============================`);
	// 	verboseLines.push(``);
	// }

	if (p.error) {
		log.generate(`生成进程运行失败: 发生错误: ${p.error.message}`);
		throw new Error(`无法启动进程(${url}): ${p.error.message}`);
	}
	if (p.status === 0 && !p.signal) {
		const code = `/*${JSON.stringify([process.execPath, ...nodeArgs, fileURLToPath(url)])}*/\n\n${p.stdout}`;
		log.generate(`成功: ${typeof code}, ${code.length} 个字符`);
		return {
			format: 'module',
			shortCircuit: true,
			source: Buffer.from(code, 'utf8'),
		};
	}

	log.generate(`生成进程运行失败: 状态=${p.status}, 信号=${p.signal}, 标准错误输出=${p.stderr.slice(0, 200).replace(hiddenChars, ' ')}...`);
	console.error(`生成进程(${url})运行失败:`);

	if (p.stderr.includes(protocolMagic)) {
		const jsonReg = new RegExp(`^${protocolMagic}\\|(.+)$`, 'gm');
		const json = jsonReg.exec(p.stderr)?.at(1);
		if (json) {
			log.generate('在标准错误输出中找到协议魔术串，尝试解析JSON错误信息');
			let data: any;
			try {
				data = JSON.parse(json);
			} catch {
				log.generate('在标准错误输出中找到协议魔术串，但解析失败，无效的JSON数据: %s', json);
			}
			if (data) {
				const e = Object.create(Error.prototype);
				const message = `生成器脚本(${url})中的异常: ${data.message}`;
				Object.assign(e, data, { message });
				Object.defineProperty(e, 'stack', {
					get() {
						return data.stack.replace(firstLine, `${message}\n`);
					},
				});

				log.generate('解析的错误信息: %O', e);
				throw e;
			}
		} else {
			log.generate('在标准错误输出中找到协议魔术串，但无效');
		}
	} else {
		log.generate('在标准错误输出中未找到协议魔术串');
	}

	const stderr = p.stderr.replace(eachLineStart, '\x1B[48;5;9m \x1B[0m ');
	const ee = new Error(
		`无法判断发生了什么，以下为stderr的内容:\n==========================\n${stderr}\n==========================\n无法判断发生了什么，以上为stderr的内容.`,
	);
	ee.stack = ee.message;
	throw ee;
}

function wrapLoad(original: LoadHookSync): LoadHookSync {
	// function addLog(specifier: string, context: LoadHookContext, r: LoadFnOutput) {
	// 	verboseLines.push(`[LOAD   ] ${specifier}`);
	// 	verboseLines.push(`${context.format} → ${r.format}, shortCircuit=${r.shortCircuit}, source size=${sizeOf(r.source)}`);
	// 	verboseLines.push(`conditions: [${context.conditions?.join(', ') ?? 'no conditions'}]`);
	// 	verboseLines.push(``);
	// 	return r;
	// }

	return (url, context, defaultLoad) => {
		if (url.startsWith('node:') || url.startsWith('data:')) {
			// 内置模块和data URL不记录日志，太多了
			return original(url, context, defaultLoad);
		}
		try {
			log.load('[EL][load] 作为[%s]加载"%s"', context.format, url);
			log.load('[EL][load]      条件[%s], 类型[%s]', context.conditions?.join(', ') ?? '无', context.importAttributes?.type);

			const r = original(url, context, (url, context) => {
				try {
					const r = defaultLoad(url, context);
					log.load('[EL][load]    成功 (default)');
					return r;
				} catch (e: any) {
					log.load('[EL][load]    文件"%s"不能加载', url);
					throw e;
				}
			});
			log.load('[EL][load] 成功作为[%s]加载"%s"成功, shortCircuit [%s], size [%s]', r.format, url, r.shortCircuit, sizeOf(r.source));
			return r;
		} catch (e: any) {
			log.load('[EL][load] 失败(throw) %s', e.code ?? e.name ?? e.message ?? '不知道什么错误');
			throw e;
		}
	};
}

export const loadFunction = log.load.enabled ? wrapLoad(myLoad) : myLoad;
