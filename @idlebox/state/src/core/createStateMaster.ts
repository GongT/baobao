import Baobab, { Path } from 'baobab';
import { StateMaster } from '../ipc/server';

interface IOptions {
	development: boolean;
	defaultState: any;
}

export function createMaster(options: Partial<IOptions> = {}): StateMaster {
	const stateObject = new Baobab(options.defaultState || {}, {
		immutable: !!options.development,
		lazyMonkeys: !options.development,
		validate: validationFunction,
	});

	return new StateMaster(stateObject);
}

function validationFunction(_previousState: any, _newState: any, _affectedPaths?: Path[]): Error | undefined {
	// Perform validation here and return an error if the tree is invalid
	return undefined;
}
