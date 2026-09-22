import type { IFormatter } from '../api/types.js';

// @ts-ignore optional import
export let createBiomeFormatter: () => IFormatter<import('@idlebox/json-edit-biome').IBiomeFormatOptions>;

// @ts-ignore optional import
export let BiomeFormat: IFormatter<import('@idlebox/json-edit-biome').IBiomeFormatOptions>;

try {
	// @ts-ignore optional import
	const mdl = await import('@idlebox/json-edit-biome');

	// @ts-ignore optional import
	createBiomeFormatter = mdl.createBiomeFormatter;

	// @ts-ignore optional import
	BiomeFormat = mdl.BiomeFormat;
} catch {}
