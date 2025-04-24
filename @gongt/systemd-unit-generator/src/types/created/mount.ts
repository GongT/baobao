// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IMountSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#What= */
	What?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#Where= */
	Where?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#Type= */
	Type?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#Options= */
	Options?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#SloppyOptions= */
	SloppyOptions?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#LazyUnmount= */
	LazyUnmount?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#ReadWriteOnly= */
	ReadWriteOnly?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#ForceUnmount= */
	ForceUnmount?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#DirectoryMode= */
	DirectoryMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#TimeoutSec= */
	TimeoutSec?: string | number;
}

export const mountFields: readonly string[] = [
	'What',
	'Where',
	'Type',
	'Options',
	'SloppyOptions',
	'LazyUnmount',
	'ReadWriteOnly',
	'ForceUnmount',
	'DirectoryMode',
	'TimeoutSec',
];
