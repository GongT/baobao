import type TypeScriptApi from 'typescript';
import { dirname, resolve } from 'path';
import { findUpUntil, findUpUntilSync } from '@idlebox/node';
import { loadFile, saveFile } from '@idlebox/node-ignore-edit';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { ILogger, MyError } from './logger';
import { ApiHost } from './tsapi.helpers';

interface IOptions {
	outDir: string;
	tsconfig: string;
	indexFile: string;
	logger: ILogger;
	project: TypeScriptApi.ParsedCommandLine;
}

export async function normalizeProject(options: IOptions) {
	const gitconfig = findUpUntilSync(options.tsconfig, '.git');
	if (gitconfig) {
		const gitignore = resolve(dirname(gitconfig), '.gitignore');
		await addGitIgnore(gitignore, options.indexFile);
		options.logger.log(`update ${gitignore}`);
	} else {
		options.logger.error('did not found .git folder');
	}

	const pkgJsonPath = await findUpUntil(options.tsconfig, 'package.json');
	if (!pkgJsonPath) {
		throw new MyError(`did not found package.json (from ${options.tsconfig})`);
	}
	const packageRoot = dirname(pkgJsonPath);
	const npmignore = resolve(packageRoot, '.npmignore');
	await addNpmIgnore(npmignore, ApiHost.relativePosix(packageRoot, options.outDir));
	options.logger.log(`update ${npmignore}`);

	const pkgJson = await loadJsonFile(pkgJsonPath);
	pkgJson.types = ApiHost.relativePosix(packageRoot, resolve(options.outDir, 'typings', options.indexFile));
	await writeJsonFileBack(pkgJson);
	options.logger.log(`update ${pkgJsonPath}`);
}

async function addGitIgnore(gitignore: string, indexFile: string) {
	const ignore = await loadFile(gitignore);
	ignore['Generated Files']!.push(indexFile);
	await saveFile(ignore);
}

async function addNpmIgnore(npmignore: string, outDir: string) {
	const ignore = await loadFile(npmignore);
	ignore['Temp Files']!.push(`${outDir}/**/*.d.ts`, `!${outDir}/typings/**/*.d.ts`);
	await saveFile(ignore);
}
