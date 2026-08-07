import { ensureGlobalObject } from './globalObject.js';

const symbolRegistry = ensureGlobalObject('@@idlebox/global-symbol', () => {
	return {} as Record<string, Record<string, symbol>>;
});

/**
 * 创建一个全局符号，非常像 Symbol.for
 * 每次相同的调用都会返回同一个符号
 *
 * 但实际上是存在globalThis上的unique symbol
 *
 * @public
 */
export function createSymbol(category: string, name: string): symbol {
	if (symbolRegistry[category]?.[name]) {
		return symbolRegistry[category][name];
	}
	if (!symbolRegistry[category]) {
		symbolRegistry[category] = {};
	}
	const c = symbolRegistry[category];

	c[name] = Symbol(name);
	return c[name];
}

/**
 * 删除由 createSymbol 创建的符号
 * 如果仍有引用，再次调用 createSymbol 会与之前不等的新符号
 * @public
 */
export function deleteSymbol(category: string, name: string) {
	if (symbolRegistry[category]?.[name]) {
		const c = symbolRegistry[category];
		delete c[name];
		if (Object.keys(c).length === 0) {
			delete symbolRegistry[category];
		}
	}
}
