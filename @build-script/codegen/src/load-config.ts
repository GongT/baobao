import { dirname, normalize, resolve } from 'path';
import { findUpUntil } from '@idlebox/node';
import { loadFile, saveFile } from '@idlebox/node-ignore-edit';
import { loadJsonFileSync, writeJsonFileBackSync } from '@idlebox/node-json-edit';
import {
	Diagnostic,
	formatDiagnostic,
	FormatDiagnosticsHost,
	getParsedCommandLineOfConfigFile,
	ParseConfigFileHost,
	sys,
} from 'typescript';
import { stat } from 'fs/promises';
import { exists, MyError } from './lib';

export interface IConfig {
	rootDir: string;
	outDir: string;
	packagePath: string;
}

export async function loadConfig(target: string) {
	if (!(await exists(target))) {
		throw new Error('project did not exists: ' + target);
	}

	const st = await stat(target);
	if (st.isDirectory()) {
		target = resolve(target, 'tsconfig.json');
	}

	if (!(await exists(target))) {
		throw new Error('project did not exists: ' + target);
	}

	const ret = parse(target);

	if (ret.fileNames.find((e) => e.endsWith('.generator.ts'))) {
		console.log('[generator] patch tsconfig.json file.');
		ignoreGenerators(target);

		const found = await findUpUntil(target, '.gitignore');
		if (found) {
			console.log('[generator] patch ignore file (%s).', found);
			const ignore = loadFile(found);
			ignore['generated files'].push('*.generated.ts');
			saveFile(ignore);
		}
	}

	const rootDir = ret.options.rootDir || dirname(target);

	const pkgJson = await findUpUntil(rootDir, 'package.json');
	if (!pkgJson) {
		throw new MyError('can not find package.json');
	}

	return {
		packagePath: pkgJson,
		rootDir,
		outDir: ret.options.outDir || dirname(target),
	};
}

function ignoreGenerators(file: string) {
	const config = loadJsonFileSync(file);
	if (!config.exclude) config.exclude = [];
	config.exclude.push('**/*.generator.ts');
	writeJsonFileBackSync(config);
}

function parse(file: string) {
	const myFormatDiagnosticsHost: FormatDiagnosticsHost = {
		getCurrentDirectory: sys.getCurrentDirectory,
		getCanonicalFileName: normalize,
		getNewLine(): string {
			return sys.newLine;
		},
	};

	const myParseConfigFileHost: ParseConfigFileHost = {
		onUnRecoverableConfigFileDiagnostic(diagnostic: Diagnostic) {
			console.error(formatDiagnostic(diagnostic, myFormatDiagnosticsHost));
		},
		useCaseSensitiveFileNames: false,
		readDirectory: sys.readDirectory,
		fileExists: sys.fileExists,
		readFile: sys.readFile,
		getCurrentDirectory: sys.getCurrentDirectory,
	};

	const ret = getParsedCommandLineOfConfigFile(file, {}, myParseConfigFileHost);
	if (!ret) {
		throw new Error('Cannot parse content of file "' + file + '"');
	}
	return ret;
}
