/// <reference path="../globals.d.ts" />

import { DeferredPromise, EventRegister } from '@idlebox/common';
import { emptyDir, mkdir, pathExistsSync } from 'fs-extra';
import { transpileBootstrap } from './compile-bootstrap';
import { runESBuild } from './compile-esbuild';
import { generateIndexHtml } from './compile-html';
import { compileScss } from './compile-scss';
import { isProd, outputDir } from './library/constants';

let timer: NodeJS.Timeout | undefined;
let firstBuild = new DeferredPromise<void>();
let waiting = true;
function scheduleGenerateIndex() {
	if (timer || waiting) return;
	timer = setTimeout(() => {
		timer = undefined;

		const p = generateIndexHtml(params);

		if (!firstBuild.resolved) {
			console.log(' == index.html created');
			p.then(
				() => {
					firstBuild.complete();
				},
				(e) => {
					firstBuild.error(e);
				}
			);
		}
	}, 500);
}

const params: Record<string, string> = {};

export async function execute(watch = false) {
	console.log('mode: %s, version: %s', watch ? 'watch' : 'build', isProd ? 'production' : 'development');

	console.log(' == prepare temp output dir');
	if (pathExistsSync(outputDir)) {
		await emptyDir(outputDir);
	} else {
		await mkdir(outputDir);
	}

	// console.log(' == generate loader');
	// await generateLoader();

	const onScssCompiled = compileScss(watch);
	onScssCompiled((e) => {
		if (e instanceof Error) {
			console.error(' == Scss compile failed:', e.message);
		} else {
			params.__CSS_INDEX__ = e.index;
			params.__CSS_EARLY__ = e.preload;

			console.log(' == Scss compile complete');
			scheduleGenerateIndex();
		}
	});

	const onProjectCompiled = await runESBuild(watch);
	onProjectCompiled((e) => {
		if (e instanceof Error) {
			console.error(' == 项目编译失败');
		} else {
			console.log(' == 项目代码构建成功', e);
			params.__JS_MAIN__ = e;
			scheduleGenerateIndex();
		}
	});

	const onLoaderCompiled = transpileBootstrap(watch);
	onLoaderCompiled((e) => {
		if (e instanceof Error) {
			console.error(' == 编译loader失败:', e.message);
		} else {
			console.log(' == 加载器编译成功');
			params.__JS_BOOTSTRAP__ = e;
			scheduleGenerateIndex();
		}
	});

	if (watch) console.log(' == 首次生成...');

	await waitAll(onScssCompiled, onProjectCompiled, onLoaderCompiled);
	waiting = false;

	if (watch) console.log(' == 首次生成结束');

	await scheduleGenerateIndex();
	console.log(' == index.html 创建成功');

	await firstBuild.p;
}

function waitAll(...events: EventRegister<any>[]) {
	return new Promise<void>((resolve, reject) => {
		const s = new Array(events.length).fill(false);
		for (const [index, onEmit] of events.entries()) {
			onEmit((e) => {
				if (e instanceof Error) return reject(e);

				s[index] = true;

				if (s.every((e) => e)) {
					resolve();
				}
			});
		}
	});
}
