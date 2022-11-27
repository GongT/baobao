import { existsSync } from 'fs';
import { createRequire } from 'module';
import { basename, resolve } from 'path';
import { createDynamicReader, loadInheritedJson } from '@idlebox/json-extends-loader';
import { IExtendParsedCommandLine, loadTsConfigJsonFile } from '@idlebox/tsconfig-loader';
import { RigConfig } from '@rushstack/rig-package';

import type * as TApiExtractor from '@microsoft/api-extractor';
import type { HeftConfiguration } from '@rushstack/heft';
import type { ITypeScriptConfigurationJson } from '@rushstack/heft/lib/plugins/TypeScriptPlugin/TypeScriptPlugin';

const cache = new WeakMap<HeftConfiguration, RushStackConfig>();

const isModuleResolutionError = (ex: any) =>
	typeof ex === 'object' &&
	!!ex &&
	'code' in ex &&
	(ex.code === 'MODULE_NOT_FOUND' || ex.code === 'ERR_MODULE_NOT_FOUND');

export function loadHeftConfig(heftConfiguration: HeftConfiguration): RushStackConfig {
	if (!cache.has(heftConfiguration)) {
		cache.set(heftConfiguration, new RushStackConfig(heftConfiguration.buildFolder, heftConfiguration.rigConfig));
	}
	return cache.get(heftConfiguration)!;
}

export interface IWarning {
	(message: string): void;
}

export class RushStackConfig {
	private typescriptConfig?: ITypeScriptConfigurationJson;
	private tsconfigConfig?: IExtendParsedCommandLine;
	private apiExtractorConfig?: TApiExtractor.IConfigFile;
	private readonly rigConfig: RigConfig;
	private readonly localRequire: NodeRequire;
	private readonly rigRequire?: NodeRequire;
	private readonly localRequirePath: string;
	private readonly rigRequirePath?: string;
	public readonly projectFolder: string;

	/**
	 *
	 * @param projectFolder absolute path of directory where the package.json is in
	 */
	constructor(projectFolder: string, rigConfig?: RigConfig, private readonly warning: IWarning = console.warn) {
		this.rigConfig = rigConfig || RigConfig.loadForProjectFolder({ projectFolderPath: projectFolder });
		if (this.rigConfig.rigFound) {
			this.rigRequirePath = this.rigConfig.getResolvedProfileFolder();
			this.rigRequire = createRequire(this.rigRequirePath);
		}
		this.projectFolder = this.rigConfig.projectFolderPath;
		this.localRequirePath = this.projectFolder;
		this.localRequire = createRequire(this.localRequirePath + '/package.json');

		this.resolve = this.resolve.bind(this);
		this.require = this.require.bind(this);
		Object.assign(this.require, { resolve: this.resolve });
	}

	private resolveConfigFile(name: string) {
		let path = resolve(this.projectFolder, 'config', name);
		if (existsSync(path)) {
			return path;
		}

		if (!existsSync(resolve(this.projectFolder, 'package.json'))) {
			throw new Error(
				`can not resolve ${name}. another error during resolve: package.json did not exists in projectFolder(${this.projectFolder})`
			);
		}

		return this.loadRig('typescript.json');
	}
	private loadRig(file: string) {
		if (!this.rigConfig.rigFound) {
			return undefined;
		}
		const cfgFile = resolve(this.rigConfig.getResolvedProfileFolder(), file);
		if (existsSync(cfgFile)) {
			return cfgFile;
		}
		return undefined;
	}

	require(packageName: string): any {
		return require(this.resolve(packageName));
	}

	resolve(packageName: string): string {
		let e1: Error;
		try {
			return this.localRequire.resolve(packageName);
		} catch (e: any) {
			if (!isModuleResolutionError(e)) {
				throw e;
			}
			e1 = e;
		}

		if (this.rigRequire) {
			try {
				return this.rigRequire.resolve(packageName);
			} catch (e: any) {
				if (!isModuleResolutionError(e)) {
					throw e;
				}
			}
		}

		const e: Error = Object.create(e1.constructor.prototype);
		let message = `Cannot find module '${packageName}'\nRequire stack:\n- ${this.localRequirePath}`;
		if (this.rigRequirePath) {
			message += '\n- ' + this.rigRequirePath;
		}
		throw Object.assign(e, { code: 'MODULE_NOT_FOUND', message, stack: e1.stack });
	}

	apiExtractor(): TApiExtractor.IConfigFile | undefined {
		if (!this.apiExtractorConfig) {
			const file = this.resolveConfigFile('api-extractor.json');
			if (file) {
				const apiExtractor: typeof TApiExtractor = this.require('@microsoft/api-extractor');
				this.apiExtractorConfig = wrapApiExtractorConfig(
					this.projectFolder,
					apiExtractor.ExtractorConfig.loadFile(file)
				);
			}
		}
		return this.apiExtractorConfig;
	}

	typescript(): ITypeScriptConfigurationJson {
		if (!this.typescriptConfig) {
			let cfgFile = this.resolveConfigFile('typescript.json');

			let cfg: ITypeScriptConfigurationJson;
			if (cfgFile) {
				cfg = loadInheritedJson(cfgFile, {
					cwd: this.projectFolder,
					readJsonFile: createDynamicReader(resolveProjectFolder),
				});
			} else {
				this.warning('missing config/typescript.json (searched rig package), using internal resolver.');
				cfg = {
					project: resolve(this.projectFolder, 'tsconfig.json'),
					maxWriteParallelism: undefined,
				};
			}
			this.typescriptConfig = cfg;
		}

		return this.typescriptConfig;
	}

	tsconfigPath(): string {
		const cfg = this.typescript().project;
		if (cfg) return cfg;
		this.warning(`missing "project" field in "typescript.json"`);

		return resolve(this.projectFolder, 'tsconfig.json');
	}

	tsconfig(): IExtendParsedCommandLine {
		if (!this.tsconfigConfig) {
			const proj = this.tsconfigPath();
			this.tsconfigConfig = loadTsConfigJsonFile(proj, this.require('typescript'));
		}
		return this.tsconfigConfig;
	}
}

function resolveProjectFolder(filePath: string, data: any) {
	if (data.project) {
		data.project = resolve(filePath, '../..', data.project);
	}
}

function extendStrings<T>(obj: T, i: keyof T, map: Record<string, string>) {
	if (!obj || typeof obj[i] !== 'string') return;

	let c: string = obj[i] as any;
	for (const [from, to] of Object.entries(map)) {
		c = c.replaceAll(from, to);
	}
	obj[i] = c as any;
}
function wrapApiExtractorConfig(packagePath: string, config: TApiExtractor.IConfigFile) {
	const packageName = require(resolve(packagePath, 'package.json')).name;
	const unscopedPackageName = basename(packageName);

	const pu = {
		'<packageName>': packageName,
		'<unscopedPackageName>': unscopedPackageName,
	};
	const ppu = {
		'<projectFolder>': config.projectFolder!,
		...pu,
	};
	extendStrings(config, 'mainEntryPointFilePath', ppu);
	extendStrings(config.compiler!, 'tsconfigFilePath', ppu);
	extendStrings(config.apiReport!, 'reportFileName', pu);
	extendStrings(config.apiReport!, 'reportFolder', ppu);
	extendStrings(config.apiReport!, 'reportTempFolder', ppu);
	extendStrings(config.docModel!, 'apiJsonFilePath', ppu);

	extendStrings(config.dtsRollup!, 'untrimmedFilePath', ppu);
	extendStrings(config.dtsRollup!, 'alphaTrimmedFilePath', ppu);
	extendStrings(config.dtsRollup!, 'betaTrimmedFilePath', ppu);
	extendStrings(config.dtsRollup!, 'publicTrimmedFilePath', ppu);

	extendStrings(config.tsdocMetadata!, 'tsdocMetadataFilePath', ppu);

	return config;
}
