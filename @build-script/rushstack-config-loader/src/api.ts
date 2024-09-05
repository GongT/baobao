import { createRequire } from 'module';
import { basename, resolve } from 'path';
import { createDynamicReader, loadInheritedJson } from '@idlebox/json-extends-loader';
import { IFilledOptions, loadTsConfigJsonFile } from '@idlebox/tsconfig-loader';
import { IRigConfig, RigConfig } from '@rushstack/rig-package';

import type TApiExtractor from '@microsoft/api-extractor';
import type { HeftConfiguration } from '@rushstack/heft';
import type { ITypeScriptConfigurationJson } from '@rushstack/heft-typescript-plugin';
const cache = new WeakMap<HeftConfiguration, RushStackConfig>();

const isModuleResolutionError = (ex: any) =>
	typeof ex === 'object' &&
	!!ex &&
	'code' in ex &&
	(ex.code === 'MODULE_NOT_FOUND' || ex.code === 'ERR_MODULE_NOT_FOUND');

export function loadHeftConfig(heftConfiguration: HeftConfiguration): RushStackConfig {
	if (!cache.has(heftConfiguration)) {
		cache.set(
			heftConfiguration,
			new RushStackConfig(heftConfiguration.buildFolderPath, heftConfiguration.rigConfig),
		);
	}
	return cache.get(heftConfiguration)!;
}

export interface IWarning {
	(message: string): void;
}

export class RushStackConfig {
	private typescriptConfig?: ITypeScriptConfigurationJson;
	private tsconfigConfig?: IFilledOptions;
	private apiExtractorConfig?: TApiExtractor.IConfigFile;
	private readonly rigConfig: IRigConfig;
	private readonly localRequire: NodeRequire;
	private readonly rigRequire?: NodeRequire;
	private readonly localRequirePath: string;
	private readonly rigRequirePath?: string;
	public readonly projectFolder: string;

	/**
	 *
	 * @param projectFolder absolute path of directory where the package.json is in
	 */
	constructor(
		projectFolder: string,
		rigConfig?: IRigConfig,
		private readonly warning: IWarning = console.warn,
	) {
		this.rigConfig = rigConfig || RigConfig.loadForProjectFolder({ projectFolderPath: projectFolder });
		if (this.rigConfig.rigFound) {
			this.rigRequirePath = resolve(this.rigConfig.getResolvedProfileFolder(), '../..');
			this.rigRequire = createRequire(this.rigRequirePath + '/package.json');
		}
		this.projectFolder = this.rigConfig.projectFolderPath;
		this.localRequirePath = this.projectFolder;
		this.localRequire = createRequire(this.localRequirePath + '/package.json');

		this.resolve = this.resolve.bind(this);
		this.require = this.require.bind(this);
		Object.assign(this.require, { resolve: this.resolve });
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
			const file = this.rigConfig.tryResolveConfigFilePath('config/api-extractor.json');
			if (file) {
				const apiExtractor: typeof TApiExtractor = this.require('@microsoft/api-extractor');
				this.apiExtractorConfig = wrapApiExtractorConfig(
					this.projectFolder,
					apiExtractor.ExtractorConfig.loadFile(file),
				);
			}
		}
		return this.apiExtractorConfig;
	}

	public typescriptSearchSrcFolder = false;
	private defaultTypeScript() {
		const r = this.rigConfig.tryResolveConfigFilePath('tsconfig.json');
		if (r) return r;

		if (this.typescriptSearchSrcFolder) {
			const r = this.rigConfig.tryResolveConfigFilePath('src/tsconfig.json');
			if (r) return r;
		}

		this.warning('internal resolver failed.');
		return undefined;
	}

	private projectRootResolver(_file: string, data: any) {
		if (data.project) {
			data.project = resolve(this.projectFolder, data.project);
		}
	}

	typescript(): ITypeScriptConfigurationJson {
		if (!this.typescriptConfig) {
			let cfgFile = this.rigConfig.tryResolveConfigFilePath('config/typescript.json');

			let cfg: ITypeScriptConfigurationJson;
			if (cfgFile) {
				this.warning(`found config file: ${cfgFile}`);
				cfg = loadInheritedJson(cfgFile, {
					cwd: this.projectFolder,
					readJsonFile: createDynamicReader(this.projectRootResolver.bind(this)),
				});
			} else {
				this.warning('missing config/typescript.json (searched rig package), using internal resolver.');
				const project = this.defaultTypeScript();
				cfg = { project };
			}
			this.typescriptConfig = cfg;
		}

		return this.typescriptConfig;
	}

	tsconfigPath() {
		const cfg = this.typescript().project;
		// this.warning(`using "project" field in "typescript.json": ${cfg}`);
		return cfg;
	}

	tsconfig(alterPath?: string): IFilledOptions {
		if (alterPath) {
			const path = this.rigConfig.tryResolveConfigFilePath(alterPath);
			if (!path) {
				throw new Error('file not found: ' + alterPath);
			}
			return loadTsConfigJsonFile(path, this.require('typescript')).options;
		} else if (!this.tsconfigConfig) {
			const proj = this.tsconfigPath();

			if (proj) {
				this.tsconfigConfig = loadTsConfigJsonFile(proj, this.require('typescript')).options;
			} else {
				this.tsconfigConfig = loadTsConfigJsonFile(
					resolve(this.projectFolder, 'tsconfig.json'),
					this.require('typescript'),
				).options;
			}
		}
		return this.tsconfigConfig;
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
