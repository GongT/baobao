import { loadInheritedJson } from '@idlebox/json-extends-loader';
import { type IRigConfig, RigConfig } from '@rushstack/rig-package';
import deepmerge, { type Options } from 'deepmerge';
import { resolve as importResolve } from 'import-meta-resolve';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateSchema, ValidationError } from './ajv.js';
import { isModuleResolutionError } from './functions.js';

export type IWarning = (message: string) => void;

/**
 * 主类，通用项目配置文件加载器
 */
export class ProjectConfig {
	public readonly rigConfig: IRigConfig;
	private readonly rigPackageUrl?: string;
	private readonly currentPackageUrl: string;
	public readonly projectFolder: string;

	/**
	 *
	 * @param projectFolder absolute path of directory where the package.json is in
	 */
	constructor(
		projectFolder: string,
		rigConfig?: IRigConfig,
		public readonly warning: IWarning = console.warn,
	) {
		this.rigConfig = rigConfig || RigConfig.loadForProjectFolder({ projectFolderPath: projectFolder });
		if (this.rigConfig.rigFound) {
			this.rigPackageUrl = pathToFileURL(
				resolve(this.rigConfig.getResolvedProfileFolder(), '../../package.json'),
			).toString();
		}
		this.projectFolder = this.rigConfig.projectFolderPath;
		this.currentPackageUrl = pathToFileURL(resolve(this.projectFolder, 'package.json')).toString();

		this.resolve = this.resolve.bind(this);
		this.import = this.import.bind(this);
	}

	async import<T = any>(packageName: string): Promise<T> {
		const pkg: any = await import(this.resolve(packageName));
		if (pkg.default) {
			return pkg.default;
		}
		return pkg;
	}

	resolve(packageName: string): string {
		let e1: Error;
		try {
			return importResolve(packageName, this.currentPackageUrl);
		} catch (e: any) {
			if (!isModuleResolutionError(e)) {
				throw e;
			}
			e1 = e;
		}

		if (this.rigPackageUrl) {
			try {
				return importResolve(packageName, this.rigPackageUrl);
			} catch (e: any) {
				if (!isModuleResolutionError(e)) {
					throw e;
				}
			}
		}

		const e: Error = Object.create(e1.constructor.prototype);
		let message = `Cannot find module '${packageName}'\nRequire stack:\n- ${this.projectFolder}`;
		if (this.rigPackageUrl) {
			message += `\n- ${this.rigPackageUrl}`;
		}
		throw Object.assign(e, { code: 'MODULE_NOT_FOUND', message, stack: e1.stack });
	}

	getJsonConfigInfo(name: string): ConfigFile {
		return this.getFileInfo(`config/${name}.json`);
	}

	getFileInfo(path: string): ConfigFile {
		const proj = resolve(this.rigConfig.projectFolderPath, path);
		const rig = resolve(this.rigConfig.getResolvedProfileFolder(), path);

		return {
			effective: this.rigConfig.tryResolveConfigFilePath(path),
			project: {
				path: proj,
				exists: existsSync(proj),
			},
			rig: {
				path: rig,
				exists: existsSync(rig),
			},
		};
	}

	/**
	 * 同时加载 rig 和项目的 config/xxx.json 文件
	 * 目前使用deepmerge 合并两个配置文件
	 *
	 * TODO: 实现此处的 merge 方法 https://heft.rushstack.io/pages/advanced/heft-config-file/
	 *
	 * @throws {Error} 如果配置文件不符合 schemaContent 的要求，则抛出错误
	 */
	loadBothJson<T>(name: string, schemaContent?: any, mergeConfig?: Options): T {
		const data = this._loadBothJson<T>(name, mergeConfig);
		if (schemaContent) {
			try {
				validateSchema(data, schemaContent);
			} catch (e: unknown) {
				console.log(data);
				if (e instanceof ValidationError) {
					const files = this.getJsonConfigInfo(name);
					e.message = `invalid "${name}.json"${e.message}\n  * project file: ${files.project.path}\n  * rig file: ${files.rig.path}`;
				}
				throw e;
			}
		}
		return data;
	}
	private _loadBothJson<T>(name: string, mergeConfig?: Options): T {
		const files = this.getJsonConfigInfo(name);

		let result: any;
		if (files.rig.exists) {
			result = loadInheritedJson(files.rig.path);
		}
		if (files.project.exists) {
			const child = loadInheritedJson(files.project.path);
			if (result) {
				return deepmerge(result, child, mergeConfig);
			} else {
				return child;
			}
		} else if(result){
			return result;
		}else{
			throw new Error(`No config file found for "${name}.json".\n  * project file: ${files.project.path}\n  * rig file: ${files.rig.path}`);
		}
	}
}

type IFile = {
	path: string;
	exists: boolean;
};
type ConfigFile = {
	effective: string | undefined;
	project: IFile;
	rig: IFile;
};
