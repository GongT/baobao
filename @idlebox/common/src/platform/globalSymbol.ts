import { ensureGlobalObject } from './globalObject.js';

const symbolRegistry = ensureGlobalObject('@@idlebox/global-symbol', () => {
	return {} as Record<string, Record<string, symbol>>;
});

/**
 * Get a symbol singleton, if not exists, create it
 *
 * this is very like Symbol.for, but not real global symbol
 * @public
 */
export function createSymbol(category: string, name: string): symbol {
	if (symbolRegistry[category]?.[name]) {
		return symbolRegistry[category]?.[name]!;
	}
	if (!symbolRegistry[category]) {
		symbolRegistry[category] = {};
	}
	const c = symbolRegistry[category]!;

	return (c[name] = Symbol(name));
}

/**
 * Delete a symbol from window/global object
 * @public
 */
export function deleteSymbol(category: string, name: string) {
	if (symbolRegistry[category]?.[name]) {
		const c = symbolRegistry[category]!;
		delete c[name];
		if (Object.keys(c).length === 0) {
			delete symbolRegistry[category];
		}
	}
}
