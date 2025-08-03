// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IDeviceTheUdevDatabaseOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#SYSTEMD_WANTS= */
	SYSTEMD_WANTS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#SYSTEMD_WANTS= */
	SYSTEMD_USER_WANTS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#SYSTEMD_ALIAS= */
	SYSTEMD_ALIAS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#SYSTEMD_READY= */
	SYSTEMD_READY?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#ID_MODEL_FROM_DATABASE= */
	ID_MODEL_FROM_DATABASE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#ID_MODEL_FROM_DATABASE= */
	ID_MODEL?: MaybeArray<string>;
}

export const deviceTheUdevDatabaseFields: readonly string[] = ['SYSTEMD_WANTS', 'SYSTEMD_USER_WANTS', 'SYSTEMD_ALIAS', 'SYSTEMD_READY', 'ID_MODEL_FROM_DATABASE', 'ID_MODEL'];
