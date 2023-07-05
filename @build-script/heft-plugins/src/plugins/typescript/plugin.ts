import type { CancellationToken, HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession } from '@rushstack/heft';
import type TypeScriptApi from 'typescript';
import { basename, dirname } from 'path';
import { getTypeScript } from '../../misc/getTypeScript';
import { loadTsConfigJson } from '../../misc/loadTsConfigJson';
import { getCompilerHost } from './helpers/compiler';
import { printCompileDiagnostic } from './helpers/printDiagnostic';
import { loadTransformers } from './helpers/transform-load';
import { IMyOptions } from './helpers/type';

const PLUGIN_NAME = 'typescript';

export default class TypeScriptPlugin implements IHeftTaskPlugin<IMyOptions> {
	apply(session: IHeftTaskSession, heftConfiguration: HeftConfiguration, options: IMyOptions = {}): void {
		const compilerOptions = Object.assign({}, options.compilerOptions);
		if (options.fast) {
			Object.assign(compilerOptions, {
				skipDefaultLibCheck: true,
				skipLibCheck: true,
				incremental: false,
				composite: false,
				declaration: false,
				declarationMap: false,
				alwaysStrict: false,
				isolatedModules: true,
				tsBuildInfoFile: null as any,
				declarationDir: null as any,
			} as TypeScriptApi.CompilerOptions);
		}

		session.hooks.run.tapPromise(PLUGIN_NAME, async ({ cancellationToken }) => {
			await this.executeBuild(
				session,
				heftConfiguration,
				{
					...options,
					compilerOptions,
				},
				cancellationToken
			);
		});

		// session.hooks.runIncremental.tapPromise(PLUGIN_NAME, (_opt) => {});
	}

	private async executeBuild(
		session: IHeftTaskSession,
		configuration: HeftConfiguration,
		options: IMyOptions,
		cancellationToken: CancellationToken
	) {
		const ts = await getTypeScript(session, configuration);

		const command = await loadTsConfigJson(session.logger, ts, configuration.rigConfig, options);
		session.logger.terminal.writeVerboseLine('tsconfig file loaded');

		if (command.options.module !== ts.ModuleKind.CommonJS && command.options.module! < ts.ModuleKind.ES2015) {
			throw new Error(
				`unsupported module type: ${
					ts.ModuleKind[command.options.module!]
				} (current only support commonjs and esnext)`
			);
		}

		command.options.inlineSourceMap = false;

		const compilerHost = getCompilerHost(ts, command.options, cancellationToken);
		let innerProgram: TypeScriptApi.Program;
		// const isolatedModules = !!options.fast && !!command.options.isolatedModules;

		innerProgram = ts.createProgram({
			rootNames: command.fileNames,
			configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(command),
			options: command.options,
			projectReferences: command.projectReferences,
			host: compilerHost,
			oldProgram: undefined,
		});

		const diagnostics = [];
		diagnostics.push(...innerProgram.getConfigFileParsingDiagnostics());
		diagnostics.push(...innerProgram.getOptionsDiagnostics());
		if (!!options.fast) {
			diagnostics.push(...innerProgram.getSyntacticDiagnostics());
			diagnostics.push(...innerProgram.getGlobalDiagnostics());
			diagnostics.push(...innerProgram.getSemanticDiagnostics());
			if (!!(command.options.declaration || command.options.composite)) {
				diagnostics.push(...innerProgram.getDeclarationDiagnostics());
			}
		}
		const sortedDiagnostics = ts.sortAndDeduplicateDiagnostics(diagnostics || []);

		printCompileDiagnostic(ts, !!options.fast, configuration.buildFolderPath, session.logger, sortedDiagnostics);
		session.logger.terminal.writeVerboseLine('program created');

		if (!options.extension) options.extension = getExtension(ts, command.options);

		const customTransformers = await loadTransformers(
			compilerHost,
			innerProgram,
			session,
			configuration,
			options,
			ts
		);

		const result = innerProgram.emit(undefined, writeFile, undefined, undefined, customTransformers);
		printCompileDiagnostic(ts, !!options.fast, configuration.buildFolderPath, session.logger, result.diagnostics);
		session.logger.terminal.writeVerboseLine('emit complete');

		if (options.fast) session.logger.terminal.write('[FAST]');
		session.logger.terminal.writeLine(
			`typescript compiled. ${ts.ModuleKind[command.options.module!]}: ${command.options.outDir}`
		);
		return;

		function writeFile(
			fileName: string,
			text: string,
			writeByteOrderMark: boolean,
			onError?: (message: string) => void,
			_sourceFiles?: readonly TypeScriptApi.SourceFile[],
			_data?: TypeScriptApi.WriteFileCallbackData
		) {
			const dir = dirname(fileName);
			const base = basename(fileName);
			const newBase = base.replace(/\.jsx?(\.map$|$)/i, options.extension + '$1');
			// session.logger.terminal.writeVerboseLine(`   * write: ${dir}/{${base} => ${newBase}}`);

			if (newBase.endsWith('.map')) {
				const mapData = JSON.parse(text);
				if (mapData.file) {
					mapData.file = mapData.file.replace(/\.js(x?)$/i, options.extension + '$1');
				} else {
					(onError || session.logger.terminal.writeWarningLine)(
						`sourcemap file ${dir}/${newBase} did not contains file.`
					);
				}
				text = JSON.stringify(mapData, null, 4);
			} else {
				if (/\.jsx?$/.test(base)) {
					text = text.trimEnd();
					const lastLineAt = text.lastIndexOf('\n');
					let lastLine = text.slice(lastLineAt + 1);
					const re = /\.js(x?\.map)$/;
					if (re.test(lastLine)) {
						lastLine = lastLine.replace(re, options.extension + '$1');
						text = text.slice(0, lastLineAt) + '\n' + lastLine + '\n';
					} else {
						(onError || session.logger.terminal.writeWarningLine)(
							`inline sourcemap not supported. (${fileName})`
						);
					}
				}
			}

			return ts.sys.writeFile(`${dir}/${newBase}`, text, writeByteOrderMark);
		}
	} // executeBuild
}

function getExtension(ts: typeof TypeScriptApi, options: TypeScriptApi.CompilerOptions) {
	if (options.module === ts.ModuleKind.CommonJS) {
		return '.cjs';
	} else if (options.module! >= ts.ModuleKind.ES2015) {
		return '.mjs';
	} else {
		return '.js';
	}
}
