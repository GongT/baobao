export interface ICommonCallback<T> {
	(error: null | undefined, data: T): void;
	(error: Error): void;
}
