import type { IAbstractConsole, IMyLogger } from './types.js';

type IBondOptions = {};

export function consoleCompatibleInternal(_options: IBondOptions, _input: IMyLogger): IAbstractConsole {
	return undefined as any;
}
