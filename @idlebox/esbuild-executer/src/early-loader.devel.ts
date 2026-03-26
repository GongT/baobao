import esbuild from 'esbuild';
import { mkdirSync, rmdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const indexFile = 'src/index.ts';
const workerFile = 'src/hook-worker.ts';

let output;
try {
	output = esbuild.buildSync({
		entryPoints: [indexFile, workerFile],
		absWorkingDir: rootDir,
		bundle: true,
		outdir: 'lib/_early-loader',
		platform: 'node',
		format: 'esm',
		banner: {
			js: `import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;

/*----*/`,
		},
		conditions: ['early-loader', 'esbuild', 'source', 'node', 'import', 'default'],
		sourcemap: 'linked',
		external: ['esbuild', 'source-map-support', 'source-map'],
		entryNames: '(entry) [name]-[hash]',
		minify: true,
		minifyIdentifiers: false,
		metafile: true,
		write: false,
		allowOverwrite: false,
	});
} catch {
	console.error('[CRITICAL] 底层加载器编译失败');
	process.exit(1);
}

if (output.outputFiles.length !== 4) {
	console.error(`[CRITICAL] 预期输出4个文件（.js/.js.map），实际得到${output.outputFiles.length}个`);
	for (const file of output.outputFiles) {
		console.error(`  - ${file.path}`);
	}
	process.exit(1);
}

const entryMap = new Map<string, string>();
for (const [rel, meta] of Object.entries(output.metafile.outputs)) {
	if (!meta.entryPoint) continue;

	const absolute = resolve(rootDir, rel);
	const outputData = output.outputFiles.find((f) => f.path === absolute);
	if (!outputData) {
		console.error(`[CRITICAL] 输出文件未找到: ${absolute}`);
		process.exit(1);
	}
	entryMap.set(meta.entryPoint.replaceAll('\\', '/'), outputData.path);
}

function get(file: string) {
	const mapped = entryMap.get(file);
	if (!mapped) {
		console.error(`[CRITICAL] 编译结果中缺少预期的入口文件: ${file}`);
		for (const [entry, output] of entryMap.entries()) {
			console.error(`  - ${entry} => ${output}`);
		}
		process.exit(1);
	}
	return mapped;
}

(globalThis as any).hookWorkerEntryFile = get(workerFile);

const entryCompiled = get(indexFile);
const lock = `${entryCompiled}.lock`;

for (let i = 0; i < 10; i++) {
	// 每个循环等待500ms，最多等待5秒
	try {
		mkdirSync(lock, { recursive: true });
		break;
	} catch (e) {
		if ((e as any).code === 'EEXIST') {
			// 已经存在，说明另一个进程正在写入，等待一会儿重试
			await new Promise((resolve) => setTimeout(resolve, 500));
		} else {
			console.error(`[CRITICAL] 无法创建编译结果锁定文件: ${lock}`);
			process.exit(1);
		}
	}
}

for (const file of output.outputFiles) {
	const target = resolve(rootDir, file.path);
	writeFileSync(target, file.contents);
}

try {
	rmdirSync(lock);
} catch {}

export const execute = await import(entryCompiled).then((m) => m.execute);
