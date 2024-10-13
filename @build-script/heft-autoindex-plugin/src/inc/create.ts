import { camelCase, IOutputShim, relativePath, ucfirst, writeFileIfChange } from '@build-script/heft-plugin-base';
import { ExportKind, TypescriptProject, type IIdentifierResult } from '@idlebox/typescript-surface-analyzer';
import { basename, dirname, resolve } from 'path';
import type TypeScriptApi from 'typescript';

export function idToString(ts: typeof TypeScriptApi, id: TypeScriptApi.StringLiteral | TypeScriptApi.Identifier) {
	if (ts.isIdentifier(id)) {
		return id.escapedText.toString();
	} else {
		return id.text;
	}
}

export function createIndex(ts: typeof TypeScriptApi, project: TypeScriptApi.ParsedCommandLine, logger: IOutputShim) {
	const outFile: string = '__create_index.generated.ts';

	if (!project.options.rootDir || !project.options.configFilePath) {
		throw new Error('missing rootDir and {internal}configFilePath');
	}

	const p = new TypescriptProject(ts, project, logger);
	const indexFileAbs = resolve(project.options.rootDir, outFile);
	logger.verbose('index file: %s', indexFileAbs);

	p.additionalIgnores.add((f: string) => f === indexFileAbs);
	p.additionalIgnores.add('**/*.test.ts');
	p.additionalIgnores.add('**/*.test.tsx');
	p.additionalIgnores.add('**/*.test.d/**');

	const list = p.execute();

	const indexDir =
		'./' +
		relativePath(
			project.options.rootDir || dirname(project.options.configFilePath as string),
			dirname(indexFileAbs),
		)
			.split('/')
			.filter((e) => e && e !== '.')
			.map(() => '..')
			.join('/');
	logger.verbose('rootDir: %s', project.options.rootDir);
	logger.verbose('configFilePath: %s', project.options.configFilePath);
	logger.verbose('index dir: %s', indexDir);
	const header = ['// DO NOT EDIT THIS FILE', '// @ts-ignore', '/* eslint-disable */'];
	const content = [];
	for (const file of list) {
		if (file.absolutePath === indexFileAbs) {
			throw new Error(
				`override output file: ${indexFileAbs} (are you import xxx from ${basename(indexFileAbs)}?)`,
			);
		}

		const path = importSpec(indexDir, file.relativePath);
		content.push(`/* ${file.relativePath} */`);

		if (file.identifiers) {
			content.push('\t// Identifiers');
			for (const def of file.identifiers.values()) {
				if (def.reference && !def.reference.id) {
					continue;
				}
				content.push(`\texport {${typeTag(def)}${idToString(ts, def.id)}} from "${path}";`);
			}
		}
		if (file.references.length) {
			content.push('\t// References');
			for (const { reference } of file.references) {
				content.push(
					`\texport * from "${importSpec(
						indexDir,
						reference.type === 'file' ? reference.relativeFromRoot : reference.name,
					)}";`,
				);
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
			content.push(`\texport {default as ${id}} from "${path}";`);
		}
	}

	const r = writeFileIfChange(indexFileAbs, header.join('\n') + '\n\n' + content.join('\n'));

	if (r) {
		logger.log('index create ok.');
	} else {
		logger.log('index create ok. (unchange)');
	}

	return indexFileAbs;
}

function importSpec(indexDir: string, target: string) {
	return (indexDir + '/' + target.replace(/\.tsx?$/, '.js')).replace(/\/\//g, '/').replace(/^\.\/\.\.\//, '../');
}

function typeTag(def: IIdentifierResult) {
	if (def.kind === ExportKind.Type) {
		return 'type ';
	} else {
		return '';
	}
}