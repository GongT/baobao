import { createDynamicReader, loadInheritedJson } from '@idlebox/json-extends-loader';
import { type IFilledOptions, loadTsConfigJsonFile } from '@idlebox/tsconfig-loader';
import type { ITypeScriptConfigurationJson } from '@rushstack/heft-typescript-plugin';
import { resolve } from 'node:path';
import type { ProjectConfig } from '../common/config.js';

function defaultTypeScript(config: ProjectConfig) {
	let r = config.rigConfig.tryResolveConfigFilePath('tsconfig.json');
	if (r) return r;

	r = config.rigConfig.tryResolveConfigFilePath('src/tsconfig.json');
	if (r) return r;

	config.logger.error('internal resolver failed.');
	return undefined;
}

/**
 * 读取 heft/typescript.json 配置文件内容
 * @returns
 */
export async function typescriptProject(config: ProjectConfig): Promise<ITypeScriptConfigurationJson> {
	const cfgFile = config.rigConfig.tryResolveConfigFilePath('config/typescript.json');

	let cfg: ITypeScriptConfigurationJson;
	if (cfgFile) {
		config.logger.error(`found config file: ${cfgFile}`);
		cfg = loadInheritedJson(cfgFile, {
			cwd: config.projectFolder,
			readJsonFile: createDynamicReader((_file, data: any) => {
				if (data.project) {
					data.project = resolve(config.projectFolder, data.project);
				}
			}),
		});
	} else {
		config.logger.error('missing config/typescript.json (searched rig package), using internal resolver.');
		const project = defaultTypeScript(config);
		cfg = { project };
	}

	// validateSchema(object, schema)

	return cfg;
}

/**
 * 读取tsconfig.json内容
 * @param alterPath 使用直接指定的 tsconfig.json 路径，而不是从 heft/typescript.json 中读取
 * @returns
 */
export async function tsconfig(config: ProjectConfig, alterPath?: string): Promise<IFilledOptions> {
	const ts = await config.import('typescript');
	if (alterPath) {
		const path = config.rigConfig.tryResolveConfigFilePath(alterPath);
		if (!path) {
			throw new Error(`file not found: ${alterPath}`);
		}
		return loadTsConfigJsonFile(path, ts).options;
	}

	const tsCfg = await typescriptProject(config);

	if (tsCfg.project) {
		return loadTsConfigJsonFile(tsCfg.project, ts).options;
	} else {
		return loadTsConfigJsonFile(resolve(config.projectFolder, 'tsconfig.json'), ts).options;
	}
}
