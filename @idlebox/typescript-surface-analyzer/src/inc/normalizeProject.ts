import { dirname, resolve } from 'path';
import { findUpUntilSync } from '@idlebox/node';
import { loadFile, saveFile } from '@idlebox/node-ignore-edit';
import { loadJsonFileSync, writeJsonFileBackSync } from '@idlebox/node-json-edit';
import { ILogger, MyError } from './logger';
import { relativePosix } from './tsapi.helpers';
import ts from 'typescript';

interface IOptions {
	outDir: string;
	tsconfig: string;
	indexFile: string;
	logger: ILogger;
	project: ts.ParsedCommandLine;
}

export function normalizeProject(options: IOptions) {
	const gitconfig = findUpUntilSync(options.tsconfig, '.git');
	if (gitconfig) {
		const gitignore = resolve(dirname(gitconfig), '.gitignore');
		addGitIgnore(gitignore, options.indexFile);
		options.logger.log(`update ${gitignore}`);
	} else {
		options.logger.error('did not found .git folder');
	}

	const pkgJsonPath = findUpUntilSync(options.tsconfig, 'package.json');
	if (!pkgJsonPath) {
		throw new MyError(`did not found package.json (from ${options.tsconfig})`);
	}
	const packageRoot = dirname(pkgJsonPath);
	const npmignore = resolve(packageRoot, '.npmignore');
	addNpmIgnore(npmignore, relativePosix(packageRoot, options.outDir));
	options.logger.log(`update ${npmignore}`);

	const pkgJson = loadJsonFileSync(pkgJsonPath);
	pkgJson.types = relativePosix(packageRoot, resolve(options.outDir, 'typings', options.indexFile));
	writeJsonFileBackSync(pkgJson);
	options.logger.log(`update ${pkgJsonPath}`);
}

function addGitIgnore(gitignore: string, indexFile: string) {
	const ignore = loadFile(gitignore);
	ignore['Generated Files'].push(indexFile);
	saveFile(ignore);
}

function addNpmIgnore(npmignore: string, outDir: string) {
	const ignore = loadFile(npmignore);
	ignore['Temp Files'].push(`${outDir}/**/*.d.ts`, `!${outDir}/typings/**/*.d.ts`);
	saveFile(ignore);
}
