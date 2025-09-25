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
 * Mount unit files may include [Unit] and [Install] sections, which are described in systemd.unit(5).
 *
 * Mount unit files must include a [Mount] section, which carries information about the file system mount points it supervises. A number of options that may be used in
 *
 * this section are shared with other unit types. These options are documented in systemd.exec(5) and systemd.kill(5). The options specific to the [Mount] section of mount
 *
 * units are the following:
 *
 */
export interface IMountOptions {
	/**
	 * Takes an absolute path of a device node, file or other resource to mount. See mount(8) for details. If this refers to a device node, a dependency on the respective
	 *
	 * device unit is automatically created. (See systemd.device(5) for more information.) This option is mandatory. Note that the usual specifier expansion is applied to
	 *
	 * this setting, literal percent characters should hence be written as "%%". If this mount is a bind mount and the specified path does not exist yet it is created as
	 *
	 * directory.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#What=
	 */
	What: MaybeArray<string>;
	/**
	 * Takes an absolute path of a file or directory for the mount point; in particular, the destination cannot be a symbolic link. If the mount point does not exist at
	 *
	 * the time of mounting, it is created as either a directory or a file. The former is the usual case; the latter is done only if this mount is a bind mount and the
	 *
	 * source (What=) is not a directory. This string must be reflected in the unit filename. (See above.) This option is mandatory.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#Where=
	 */
	Where: MaybeArray<string>;
	/**
	 * Takes a string for the file system type. See mount(8) for details. This setting is optional.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#Type=
	 */
	Type: MaybeArray<string>;
	/**
	 * Mount options to use when mounting. This takes a comma-separated list of options. This setting is optional. Note that the usual specifier expansion is applied to
	 *
	 * this setting, literal percent characters should hence be written as "%%".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#Options=
	 */
	Options: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If true, parsing of the options specified in Options= is relaxed, and unknown mount options are tolerated. This corresponds with
	 *
	 * mount(8)'s -s switch. Defaults to off.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#SloppyOptions=
	 */
	SloppyOptions: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If true, detach the filesystem from the filesystem hierarchy at time of the unmount operation, and clean up all references to the
	 *
	 * filesystem as soon as they are not busy anymore. This corresponds with umount(8)'s -l switch. Defaults to off.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#LazyUnmount=
	 */
	LazyUnmount: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If false, a mount point that shall be mounted read-write but cannot be mounted so is retried to be mounted read-only. If true the
	 *
	 * operation will fail immediately after the read-write mount attempt did not succeed. This corresponds with mount(8)'s -w switch. Defaults to off.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#ReadWriteOnly=
	 */
	ReadWriteOnly: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If true, force an unmount (in case of an unreachable NFS system). This corresponds with umount(8)'s -f switch. Defaults to off.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#ForceUnmount=
	 */
	ForceUnmount: MaybeArray<string>;
	/**
	 * Directories of mount points (and any parent directories) are automatically created if needed. This option specifies the file system access mode used when creating
	 *
	 * these directories. Takes an access mode in octal notation. Defaults to 0755.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#DirectoryMode=
	 */
	DirectoryMode: MaybeArray<string>;
	/**
	 * Configures the time to wait for the mount command to finish. If a command does not exit within the configured time, the mount will be considered failed and be shut
	 *
	 * down again. All commands still running will be terminated forcibly via SIGTERM, and after another delay of this time with SIGKILL. (See KillMode= in
	 *
	 * systemd.kill(5).) Takes a unit-less value in seconds, or a time span value such as "5min 20s". Pass 0 to disable the timeout logic. The default value is set from
	 *
	 * DefaultTimeoutStartSec= option in systemd-system.conf(5).
	 *
	 * Check systemd.unit(5), systemd.exec(5), and systemd.kill(5) for more settings.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.mount.html#TimeoutSec=
	 */
	TimeoutSec: string | number;
}
export interface IMountUnit {
	Mount: IMountOptions;
}
