/** biome-ignore-all lint/style/noNonNullAssertion: builder */
import { basename, resolve } from 'node:path';
import type { ProjectConfig } from '../common/config.js';

import type TApiExtractor from '@microsoft/api-extractor';

/**
 * 读取 heft/api-extractor.json 配置文件内容
 * @returns
 */
export async function apiExtractor(config: ProjectConfig): Promise<TApiExtractor.IConfigFile | undefined> {
	const file = config.rigConfig.tryResolveConfigFilePath('config/api-extractor.json');
	if (file) {
		const apiExtractor: typeof TApiExtractor = await config.import('@microsoft/api-extractor');
		return wrapApiExtractorConfig(config.projectFolder, apiExtractor.ExtractorConfig.loadFile(file));
	}

	return undefined;
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

function extendStrings<T>(obj: T, i: keyof T, map: Record<string, string>) {
	if (!obj || typeof obj[i] !== 'string') return;

	let c: string = obj[i] as any;
	for (const [from, to] of Object.entries(map)) {
		c = c.replaceAll(from, to);
	}
	obj[i] = c as any;
}
