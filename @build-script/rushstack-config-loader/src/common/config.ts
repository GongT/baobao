import { loadInheritedJson, NotFoundError } from '@idlebox/json-extends-loader';
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
	 * @param rigConfig 一个`RigConfig`，如果undefined，则自动加载
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

	getJsonConfigInfo(name: string): ResolvedFile {
		return this.getFileInfo(`config/${name}.json`);
	}

	/**
	 * 同步解析文件绝对路径
	 * @param rel 文件的相对路径
	 * @param root 当使用rig时，是否忽略profile
	 */
	getFileInfo(path: string): ResolvedFile {
		const info = this._getFileInfo(path);
		if (info.project.exists) {
			return { effective: info.project.path, ...info };
		} else if (info.rig.exists) {
			return { effective: info.rig.path, ...info };
		} else if (info.rigRoot.exists) {
			return { effective: info.rigRoot.path, ...info };
		} else {
			return { effective: undefined, ...info };
		}
	}

	private _getFileInfo(path: string): Omit<ResolvedFile, 'effective'> {
		const proj = resolve(this.rigConfig.projectFolderPath, path);

		try {
			const rigProfile = this.rigConfig.getResolvedProfileFolder();
			const rig = resolve(rigProfile, path);
			const rigRoot = resolve(rigProfile, '../..', path);

			return {
				project: { path: proj, exists: existsSync(proj) },
				rig: { path: rig, exists: existsSync(rig) },
				rigRoot: { path: rigRoot, exists: existsSync(rigRoot) },
			};
		} catch {
			return {
				project: { path: proj, exists: existsSync(proj) },
				rig: { path: '', exists: false },
				rigRoot: { path: '', exists: false },
			};
		}
	}

	/**
	 * 加载 config/xxx.json，如果没有再去找rig
	 * @param name
	 * @param schemaContent
	 */
	loadSingleJson<T>(name: string, schemaContent?: any): T {
		const files = this.getJsonConfigInfo(name);

		if (!files.effective) {
			throw new Error(
				`No config file found for "${name}.json".\n  * project file: ${files.project.path}\n  * rig file: ${files.rig.path}`,
			);
		}

		let result: any;
		try {
			result = loadInheritedJson(files.project.path);
		} catch (e) {
			if (e instanceof NotFoundError) {
				result = loadInheritedJson(files.rig.path);
			} else {
				throw e;
			}
		}

		this._read_json_validate(result, files, schemaContent);
		return result as T;
	}

	/**
	 * 加载 config/xxx.json，不尝试rig
	 * @param name
	 * @param schemaContent
	 * @throws {ValidationError} 如果配置文件不符合 schemaContent 的要求，则抛出错误
	 */
	loadPackageJsonOnly<T>(name: string, schemaContent?: any): T {
		const files = this.getJsonConfigInfo(name);
		const result = loadInheritedJson(files.project.path);
		this._read_json_validate(result, files, schemaContent);
		return result as T;
	}

	private _read_json_validate(data: any, files: ResolvedFile, schemaContent?: any) {
		if (!schemaContent) {
			return;
		}
		try {
			validateSchema(data, schemaContent);
		} catch (e: unknown) {
			if (e instanceof ValidationError) {
				e.message = `invalid "${files.effective}"${e.message}\n  * project file: ${files.project.path}\n  * rig file: ${files.rig.path}`;
			}
			throw e;
		}
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
		const files = this.getJsonConfigInfo(name);

		let result: any;
		if (files.rig.exists) {
			result = loadInheritedJson(files.rig.path);
		}
		if (files.project.exists) {
			const child = loadInheritedJson(files.project.path);
			if (result) {
				result = deepmerge(result, child, mergeConfig);
			} else {
				result = child;
			}
		} else if (result) {
			// nothing to do
		} else {
			throw new Error(
				`No config file found for "${name}.json".\n  * project file: ${files.project.path}\n  * rig file: ${files.rig.path}`,
			);
		}
		this._read_json_validate(result, files, schemaContent);
		return result;
	}
}

type IFile = {
	path: string;
	exists: boolean;
};
type ResolvedFile = {
	effective: string | undefined;
	project: IFile;
	rig: IFile;
	rigRoot: IFile;
};
