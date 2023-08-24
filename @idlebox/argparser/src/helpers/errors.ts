import { ArgumentCommand } from '../main';

export class ArgumentError extends Error {}

export class MissingArgumentError extends ArgumentError {
	constructor(cmd: ArgumentCommand) {
		super(`missing command for ${cmd.name}`);
	}
}
