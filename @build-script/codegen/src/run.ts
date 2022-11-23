import { renameSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { loadJsonFileSync, writeJsonFileBack } from '@idlebox/node-json-edit';
import { sync as globSync } from 'glob';
import { readFile, writeFile } from 'fs/promises';
import { exists, MyError } from './lib';
import type { IConfig } from './load-config';
import { FileBuilder } from './builder';

const header = `/* eslint-disable */
// @ts-ignore
/**
 * 
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 */
`;

async function genInner(config: IConfig) {
	for (const file of globSync('**/*.generator.ts', { cwd: config.rootDir, absolute: false })) {
		const filePath = resolve(config.rootDir, file);

		console.log(`[generate] ${filePath}`);
		const { generate } = (await import(filePath)) as any;
		if (typeof generate !== 'function') {
			throw new MyError('generator did not exporting {generate} function: ' + filePath);
		}
		const builder = new FileBuilder(filePath);
		let content: string = generate(builder);
		if (builder === (content as any)) {
			content = builder.toString();
		}
		if (typeof content !== 'string') {
			throw new MyError('the {generate} function did not return string: ' + filePath);
		}

		content = header + '\n\n' + content;
		await writeFileIfChange(filePath.replace(/\.generator\.ts$/, '.generated.ts'), content);
	}
}

export async function runGenerate(config: IConfig) {
	const pkgJson = loadJsonFileSync(config.packagePath);
	let needHack = false;
	if (pkgJson && pkgJson.type === 'module') {
		needHack = true;
		pkgJson.type = 'commonjs';

		renameSync(config.packagePath, config.packagePath + '.bak');
		await writeJsonFileBack(pkgJson);
	}

	const p = genInner(config);

	if (needHack) {
		p.finally(() => {
			unlinkSync(config.packagePath);
			renameSync(config.packagePath + '.bak', config.packagePath);
		});
	}

	return p;
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
