import assert from 'node:assert';
import { symbol, theState } from './tools/global.js';
import { log } from './tools/types.js';

export function getLoadedFiles(): IterableIterator<string> {
	const sets = theState.loaded;
	if (!sets) throw new Error('尝试使用@idlebox/native-executer提供的可选功能，但没有启用');

	return sets.values();
}

export function overrideImportFile(hiddenFile: URL | string, replacementFile: URL | string) {
	hiddenFile = (hiddenFile as URL).href ?? hiddenFile;
	replacementFile = (replacementFile as URL).href ?? replacementFile;

	assert.ok(hiddenFile.startsWith('file://'), 'hiddenFile must be a file URL');
	assert.ok(replacementFile.startsWith('file://'), 'replacementFile must be a file URL');

	if (!theState.overrides) theState.overrides = new Map();
	const mapping = theState.overrides;

	if (theState.loaded?.has(hiddenFile)) throw new Error(`file already loaded: ${hiddenFile}`);

	mapping.set(hiddenFile, replacementFile);
}

export function dispose() {
	(globalThis as any)[symbol].dispose();
	delete (globalThis as any)[symbol];
	log.main('loader hooks removed');
}
