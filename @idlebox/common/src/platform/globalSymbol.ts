import { ensureGlobalObject } from './globalObject';

const symbolRegistry = ensureGlobalObject(`@@idlebox/global-symbol`, () => {
	return {} as Record<string, Record<string, symbol>>;
});

/**
 * Get a symbol singleton, if not exists, create it
 *
 * this is very like Symbol.for, but not real global symbol
 * @public
 */
export function createSymbol(category: string, name: string): symbol {
	if (symbolRegistry[category] && symbolRegistry[category][name]) {
		return symbolRegistry[category][name];
	} else {
		if (!symbolRegistry[category]) {
			symbolRegistry[category] = {};
		}
		symbolRegistry[category][name] = Symbol(name);
		return symbolRegistry[category][name];
	}
}

/**
 * Delete a symbol from window/global object
 * @public
 */
export function deleteSymbol(category: string, name: string) {
	if (symbolRegistry[category] && symbolRegistry[category][name]) {
		delete symbolRegistry[category][name];
		if (Object.keys(symbolRegistry[category]).length === 0) {
			delete symbolRegistry[category];
		}
	}
}
