
// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IAutomountSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.automount.html#Where= */
	Where?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.automount.html#ExtraOptions= */
	ExtraOptions?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.automount.html#DirectoryMode= */
	DirectoryMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.automount.html#TimeoutIdleSec= */
	TimeoutIdleSec?: string | number;
}

export const automountFields: readonly string[] = ["Where","ExtraOptions","DirectoryMode","TimeoutIdleSec"];


