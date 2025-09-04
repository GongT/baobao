// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IPathSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.path.html#PathExists= */
	PathExists?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.path.html#PathExists= */
	PathExistsGlob?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.path.html#PathExists= */
	PathChanged?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.path.html#PathExists= */
	PathModified?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.path.html#PathExists= */
	DirectoryNotEmpty?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.path.html#Unit= */
	Unit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.path.html#MakeDirectory= */
	MakeDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.path.html#DirectoryMode= */
	DirectoryMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.path.html#TriggerLimitIntervalSec= */
	TriggerLimitIntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.path.html#TriggerLimitIntervalSec= */
	TriggerLimitBurst?: MaybeArray<string>;
}

export const pathFields: readonly string[] = [
	'PathExists',
	'PathExistsGlob',
	'PathChanged',
	'PathModified',
	'DirectoryNotEmpty',
	'Unit',
	'MakeDirectory',
	'DirectoryMode',
	'TriggerLimitIntervalSec',
	'TriggerLimitBurst',
];
