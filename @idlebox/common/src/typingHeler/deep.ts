export type DeepReadonly<T> = {
	readonly [P in keyof T]: DeepReadonly<T[P]>;
};
export type Writeable<T> = {
	-readonly [P in keyof T]: T[P];
};
export type DeepWriteable<T> = {
	-readonly [P in keyof T]: DeepWriteable<T[P]>;
};
export type DeepPartial<T> = {
	[P in keyof T]?: DeepPartial<T[P]>;
};
// TODO: deep required
