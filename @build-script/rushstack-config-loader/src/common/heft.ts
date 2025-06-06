import type { HeftConfiguration } from '@rushstack/heft';
import { ProjectConfig } from './config.js';

const cache = new WeakMap<HeftConfiguration, ProjectConfig>();

/**
 * 在 heft 插件中加载项目配置。
 * @param heftConfiguration
 * @returns
 */
export function loadHeftConfig(heftConfiguration: HeftConfiguration): ProjectConfig {
	const exists = cache.get(heftConfiguration);
	if (exists) return exists;

	const obj = new ProjectConfig(heftConfiguration.buildFolderPath, heftConfiguration.rigConfig);
	cache.set(heftConfiguration, obj);
	return obj;
}
