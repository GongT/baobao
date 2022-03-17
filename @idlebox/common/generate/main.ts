import { exists as existsAsync, readdirSync, readFile as readFileAsync, writeFile as writeFileAsync } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

let filePath: string;
const readFile = promisify(readFileAsync);
const writeFile = promisify(writeFileAsync);
const exists = promisify(existsAsync);

runGenerate().then(
	() => {
		console.log('[generate] all complete!');
		process.exit(0);
	},
	(e) => {
		console.error('生成失败: %s', filePath);
		console.error(e.stack);
		process.exit(1);
	}
);

function* walkSync(dir: string): Generator<string, void, void> {
	const files = readdirSync(dir, { withFileTypes: true });
	for (const file of files) {
		if (file.isDirectory()) {
			yield* walkSync(resolve(dir, file.name));
		} else {
			if (file.name.endsWith('.generator.ts')) yield resolve(dir, file.name);
		}
	}
}

async function runGenerate() {
	for (filePath of walkSync(resolve(import.meta.url.replace(/^file:\/\//, ''), '..', '../src'))) {
		console.log(`[generate] ${filePath}`);
		const { generate } = (await import(filePath)) as any;
		if (typeof generate !== 'function') {
			throw new Error('生成函数未定义');
		}
		const content: string = generate();
		if (typeof content !== 'string') {
			throw new Error('生成函数没有返回字符串');
		}
		await writeFileIfChange(filePath.replace(/\.generator\.ts$/, '.generated.ts'), content);
	}
}

export async function writeFileIfChange(file: string, data: string | Buffer) {
	if (await exists(file)) {
		if ((await readFile(file, 'utf-8')) === data) {
			return false;
		}
	}
	await writeFile(file, data, 'utf-8');
	return true;
}
