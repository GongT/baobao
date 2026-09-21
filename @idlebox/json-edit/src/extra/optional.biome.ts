import type { IFormatter } from '../api/types.js';

export let BiomeApiFormat: IFormatter;
export let BiomeBinaryFormat: IFormatter;
export let BiomeFormat: IFormatter;

try {
	// @ts-ignore optional import
	const mdl = await import('@idlebox/json-edit-biome');

	// @ts-ignore optional import
	BiomeApiFormat = mdl.BiomeApiFormat;

	// @ts-ignore optional import
	BiomeBinaryFormat = mdl.BiomeBinaryFormat;

	// @ts-ignore optional import
	BiomeFormat = mdl.BiomeFormat;
} catch {}
