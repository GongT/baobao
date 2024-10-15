import { createTaskPlugin, TsPluginInstance } from '@build-script/heft-plugin-base';
import type { IHeftTaskRunIncrementalHookOptions } from '@rushstack/heft';
import type TypeScriptApi from 'typescript';
import { HostCreator } from './helpers/compiler.js';
import { CustomDiagnosticPrinter } from './helpers/diagnostic.js';
import { TsPluginSystem } from './helpers/transform-load';
import { IHeftJsonOptions } from './helpers/type';
import { normalizeOptions } from './helpers/type.options.js';
import { createFileWriter } from './helpers/writeFile.js';

export class TypeScriptPlugin extends TsPluginInstance<IHeftJsonOptions> {
	private pluginSystem!: TsPluginSystem;
	private hostCreator!: HostCreator;
	private last_program?: TypeScriptApi.Program;

	override async init() {
		await super.init();

		const compilerOptions = Object.assign({}, this.pluginOptions.compilerOptions);
		if (this.pluginOptions.fast) {
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

			const [maj, min] = this.ts.versionMajorMinor.split('.').map((v) => parseInt(v));
			if (maj > 5 || (maj === 5 && min >= 6)) {
				// >=5.6
				compilerOptions.noCheck = true;
			}
		}
		this.pluginOptions.compilerOptions = compilerOptions;

		this.pluginSystem = new TsPluginSystem(this.ts, this.session, this.configuration, this.pluginOptions);
		this.hostCreator = new HostCreator(this.ts, this.session.logger);
	}

	override async run() {
		const { command } = this.loadTsConfig();
		await this.executeCompile(command);
	}

	// why not execute transformer in watch mode?
	private first = true;
	override async watch(watchOptions: IHeftTaskRunIncrementalHookOptions): Promise<void> {
		const { files, command } = await this.loadTsConfigWatch(watchOptions);
		// console.log('changed: ', files);
		if (this.first) {
			this.first = false;
			await this.executeCompile(command);
		} else {
			await this.executeCompile(command, files);
		}
	}

	private async executeCompile(command: TypeScriptApi.ParsedCommandLine, subsetFiles?: string[]) {
		const pluginOptions = normalizeOptions(this.ts, this.pluginOptions, command);
		const compilerHost = this.hostCreator.createCompilerHost(command.options);
		await this.pluginSystem.loadAll(command.options);

		// console.log(`command.options: !!! `, dumpTsConfig(ts, command.options));

		const diagHost = new CustomDiagnosticPrinter(
			this.ts,
			this.configuration.buildFolderPath,
			pluginOptions,
			this.session.logger,
		);

		// const isolatedModules = !!options.fast && !!command.options.isolatedModules;

		const rootNames = pluginOptions.fast ? command.fileNames : this.filterOutTests(command.fileNames);

		const program = this.ts.createProgram({
			rootNames: rootNames,
			configFileParsingDiagnostics: this.ts.getConfigFileParsingDiagnostics(command),
			options: command.options,
			projectReferences: command.projectReferences,
			host: compilerHost,
			oldProgram: this.last_program,
		});

		const privateApi = (program as any).getModuleResolutionCache;
		if (!privateApi) {
			throw new Error('fix me: TypeScript private object change.');
		}
		compilerHost.getModuleResolutionCache = privateApi.bind(program);

		diagHost.add(this.ts.getPreEmitDiagnostics(program));

		if (diagHost.print().shouldFail) {
			this.session.logger.terminal.writeVerboseLine('program create failed.');
			return;
		}
		this.session.logger.terminal.writeVerboseLine('program created');

		const writeCtx = createFileWriter(this.ts, this.session, pluginOptions);
		const customTransformers = this.pluginSystem.create(program, compilerHost);

		let someskip = false,
			emittedFileCnt = 0;
		if (subsetFiles) {
			this.session.logger.terminal.writeVerboseLine(
				`partial compile: ${subsetFiles.length} of ${program.getRootFileNames().length} files`,
			);
			for (const item of subsetFiles) {
				const file = program.getSourceFile(item);
				if (file) {
					const result = program.emit(file, writeCtx.writeFile, undefined, undefined, customTransformers);
					diagHost.add(result.diagnostics);
					// console.log(result);
					if (result.emitSkipped) someskip = true;
					emittedFileCnt += result.emittedFiles?.length ?? 0;
				} else {
					this.session.logger.emitWarning(new Error('file not include in program: ' + item));
				}
			}
		} else {
			this.session.logger.terminal.writeVerboseLine(
				`full project compile: ${program.getRootFileNames().length} files`,
			);
			const result = program.emit(undefined, writeCtx.writeFile, undefined, undefined, customTransformers);
			if (result.emitSkipped) someskip = true;
			emittedFileCnt += result.emittedFiles?.length ?? 0;

			diagHost.add(result.diagnostics);
		}

		diagHost.print();
		if (diagHost.shouldFail) {
			this.session.logger.terminal.writeVerboseLine(`compile error (emitSkipped=${someskip})`);
			return;
		}

		if (someskip) {
			this.session.logger.emitError(new Error(`emit skip, ${emittedFileCnt} files emitted`));
			return;
		}

		this.last_program = program;

		this.session.logger.terminal.writeVerboseLine('emit complete');

		if (pluginOptions.fast) this.session.logger.terminal.write('[FAST] ');
		this.session.logger.terminal.writeLine(
			`typescript compiled, ${writeCtx.files} file${writeCtx.files > 1 ? 's' : ''} emitted, no errors.`,
		);
		this.session.logger.terminal.writeDebugLine(`Module: ${this.ts.ModuleKind[command.options.module!]}`);
		this.session.logger.terminal.writeDebugLine(`OutDir: ${command.options.outDir}`);
	}
	private filterOutTests(fileNames: string[]) {
		const isTestFile = /\.test\.(mjs|cjs|js|tsx?)$/i;
		return fileNames.filter((e) => {
			return !isTestFile.test(e);
		});
	}
}
export default createTaskPlugin('typescript', TypeScriptPlugin);
