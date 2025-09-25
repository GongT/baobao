// biome-ignore-all lint: generated file
// biome-ignore-all assist: generated file
/* eslint-disable */
// @ts-ignore

/******************************************************************************
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 * @build-script/codegen - The Simple Code Generater
 * https://github.com/GongT/baobao
 * 
 ******************************************************************************/



// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

/**
 * Automount unit files may include [Unit] and [Install] sections, which are described in systemd.unit(5).
 *
 * Automount unit files must include an [Automount] section, which carries information about the file system automount points it supervises. The options specific to the
 *
 * [Automount] section of automount units are the following:
 *
 */
export interface IAutomountOptions {
	/**
	 * Takes an absolute path of a directory of the automount point. If the automount point does not exist at time that the automount point is installed, it is created.
	 *
	 * This string must be reflected in the unit filename. (See above.) This option is mandatory.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.automount.html#Where=
	 */
	Where: MaybeArray<string>;
	/**
	 * Extra mount options to use when creating the autofs mountpoint. This takes a comma-separated list of options. This setting is optional. Note that the usual
	 *
	 * specifier expansion is applied to this setting, literal percent characters should hence be written as "%%".
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.automount.html#ExtraOptions=
	 */
	ExtraOptions: MaybeArray<string>;
	/**
	 * Directories of automount points (and any parent directories) are automatically created if needed. This option specifies the file system access mode used when
	 *
	 * creating these directories. Takes an access mode in octal notation. Defaults to 0755.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.automount.html#DirectoryMode=
	 */
	DirectoryMode: MaybeArray<string>;
	/**
	 * Configures an idle timeout. Once the mount has been idle for the specified time, systemd will attempt to unmount. Takes a unit-less value in seconds, or a time span
	 *
	 * value such as "5min 20s". Pass 0 to disable the timeout logic. The timeout is disabled by default.
	 *
	 * Added in version 220.
	 *
	 * Check systemd.unit(5), systemd.exec(5), and systemd.kill(5) for more settings.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.automount.html#TimeoutIdleSec=
	 */
	TimeoutIdleSec: string | number;
}
export interface IAutomountUnit {
	Automount: IAutomountOptions;
}
