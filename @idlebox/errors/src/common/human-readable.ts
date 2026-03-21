export const humanReadable = Symbol('humanReadable');
export interface IHumanReadable {
	[humanReadable](): string;
}

export function isHumanReadable(error: unknown): error is IHumanReadable {
	return error instanceof Object && humanReadable in error;
}
