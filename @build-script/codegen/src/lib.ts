import { access } from 'fs/promises';
import { constants } from 'fs';

export async function exists(file: string) {
	return access(file, constants.F_OK).then(
		() => true,
		() => false
	);
}

export class MyError extends Error {
	constructor(message: string) {
		super(message);
	}
}
