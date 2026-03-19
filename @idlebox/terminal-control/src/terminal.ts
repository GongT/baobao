import { ESC } from './constants/characters.js';

export * as characters from './constants/characters.js';
export * as sequence from './constants/sequence.js';
export * as alternativeScreen from './functions/alternative.js';
export * as cursor from './functions/cursor.js';
export * as erase from './functions/erase.js';
export * as progress from './functions/progress.js';
export * as title from './functions/title.js';

export function reset() {
	process.stderr.write(`${ESC}c`);
}
