import { camelCase, ucfirst } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import { ensureParentExists, relativePath, writeFileIfChange } from '@idlebox/node';
import { ExportKind, IgnoreFiles, TypescriptProject, type IIdentifierResult, type ITypescriptFile } from '@idlebox/typescript-surface-analyzer';
import { dirname } from 'node:path';
import type TypeScriptApi from 'typescript';
import { headerComments, linterInstructions } from './modify-comment.js';

export function idToString(ts: typeof TypeScriptApi, id: TypeScriptApi.StringLiteral | TypeScriptApi.Identifier) {
	if (ts.isIdentifier(id)) {
		return id.escapedText.toString();
	}
	return id.text;
}

export interface ICreateIndexContext {
	absoluteImport?: string;
	stripTags?: readonly string[];
	extraExcludes?: readonly string[];
	ts: typeof TypeScriptApi;
	project: TypeScriptApi.ParsedCommandLine;
	outputFileAbs: string;
	logger: IMyLogger;
	verbose?: boolean;
	banner?: string;
}

export function createStandaloneIgnore(logger: IMyLogger, outputFileAbs: string, extraExcludes?: readonly string[]) {
	const ignores = new IgnoreFiles(logger);
	applyIgnores(ignores, outputFileAbs, extraExcludes);
	return ignores;
}

function applyIgnores(ignores: IgnoreFiles, outputFileAbs: string, extraExcludes?: readonly string[]) {
	ignores.add(function ignoreIndexItSelf(f: string) {
		return f === outputFileAbs;
	});
	ignores.add('**/*.test.ts');
	ignores.add('**/*.test.tsx');
	ignores.add('**/*.test.d/**');
	ignores.add('**/node_modules/**');
	if (extraExcludes) {
		for (const exclude of extraExcludes) {
			ignores.add(exclude);
		}
	}
}

interface IRet {
	watchFiles: string[];
	ignores: IgnoreFiles;
}

function sort_file(a: ITypescriptFile, b: ITypescriptFile) {
	return a.relativePath.localeCompare(b.relativePath);
}

export async function createIndex({
	logger,
	outputFileAbs,
	project,
	ts,
	absoluteImport,
	extraExcludes = [],
	stripTags = ['internal'],
	banner = '',
}: ICreateIndexContext): Promise<IRet> {
	if (!project.options.rootDir || !project.options.configFilePath) {
		logger.error('%o', project.options);
		throw new Error(`missing rootDir and {internal}configFilePath`);
	}
	if (!project.options.rootDir) {
		logger.error('%o', project.options);
		throw new Error(`missing rootDir: ${project.options.configFilePath}`);
	}

	const p = new TypescriptProject(ts, project, logger);
	logger.log('creating index file: %s', outputFileAbs);
	applyIgnores(p.additionalIgnores, outputFileAbs, extraExcludes);

	const list = p.execute(stripTags);

	const indexDir = `./${relativePath(project.options.rootDir || dirname(project.options.configFilePath as string), dirname(outputFileAbs))
		.split('/')
		.filter((e) => e && e !== '.')
		.map(() => '..')
		.join('/')}`;
	logger.debug('rootDir: %s', project.options.rootDir);
	logger.debug('configFilePath: %s', project.options.configFilePath);
	logger.debug('index dir: %s', indexDir);
	const header = [headerComments, banner, linterInstructions];
	const content = [];
	const input_files = list.map((file) => file.absolutePath);
	for (const file of list.sort(sort_file)) {
		if (file.absolutePath === outputFileAbs) {
			throw new Error(`override source file: ${outputFileAbs}`);
		}

		const path = importSpec(absoluteImport ?? indexDir, file.relativePath);
		content.push(`/* ${file.relativePath} */`);

		if (file.identifiers) {
			content.push(`\t// Identifiers (${file.identifiers.size})`);
			for (const def of file.identifiers.values()) {
				const id = idToString(ts, def.id);

				if (def.reference) {
					if (!def.reference.id && def.reference.type === 'file' && input_files.includes(def.reference.absolute)) {
						// 从本包另一个文件export，并且没有改名（x as y），且目标文件没有被忽略
						content.push(`\t// export ${typeTag(def)}{ ${id} } from "${def.reference.relativeFromRoot}";`);
						continue;
					}
				}

				content.push(`\texport ${typeTag(def)}{ ${id} } from "${path}";`);
			}
		}
		if (file.references.length) {
			content.push(`\t// References (${file.references.length})`);
			for (const { reference } of file.references) {
				if (reference.type === 'file') {
					content.push(`\texport * from "${importSpec(indexDir, reference.relativeFromRoot)}";`);
				} else {
					content.push(`\texport * from "${reference.name}";`);
				}
			}
		}
		if (file.defaultExport) {
			content.push('\t// Default');
			let id = '';
			if (file.defaultExport.id) {
				id = idToString(ts, file.defaultExport.id);
			} else {
				id = camelCase(file.relativePath);
				if (file.defaultExport.kind === ExportKind.Class || file.defaultExport.kind === ExportKind.Type) {
					id = ucfirst(id);
				}
			}
			content.push(`\texport { default as ${id} } from "${path}";`);
		}

		input_files.push(file.absolutePath);
	}

	await ensureParentExists(outputFileAbs);
	const r = await writeFileIfChange(outputFileAbs, `${header.join('\n')}\n\n${content.join('\n')}`);

	if (r) {
		logger.log('index create ok.');
	} else {
		logger.log('index create ok. (unchange)');
	}

	return {
		watchFiles: input_files,
		ignores: p.additionalIgnores,
	};
}

const tsExt = /\.tsx?$/;
const prefxUneedDot = /^\.\/\.\.\//;
function importSpec(indexDir: string, target: string) {
	return `${indexDir}/${target.replace(tsExt, '.js')}`.replace(/\/\//g, '/').replace(prefxUneedDot, '../');
}

function typeTag(def: IIdentifierResult) {
	if (def.kind === ExportKind.Type) {
		return 'type ';
	}
	return '';
}
