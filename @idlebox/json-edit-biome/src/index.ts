import type { IFormatter } from '@idlebox/json-edit';
import { Biome, BiomeApiFormat } from './fmt/api.js';
import { BiomeBinaryFormat, detectBinary } from './fmt/exec.js';
import type { IBiomeFormatOptions } from './fmt/options.js';

export let BiomeFormat: typeof BiomeApiFormat | typeof BiomeBinaryFormat | null;

export async function createBiomeFormatter(): Promise<IFormatter<IBiomeFormatOptions> | null> {
	if (BiomeFormat === undefined) {
		if (Biome) {
			BiomeFormat = BiomeApiFormat;
		} else if (await detectBinary()) {
			BiomeFormat = BiomeBinaryFormat;
		} else {
			BiomeFormat = null;
			console.error('[@idlebox/json-edit-biome] 找不到可用的 Biome 格式化器，此功能将静默禁用');
		}
	}

	if (!BiomeFormat) {
		return null;
	}

	return new BiomeFormat();
}
