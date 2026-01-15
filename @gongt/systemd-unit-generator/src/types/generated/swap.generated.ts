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
 * Swap unit files may include [Unit] and [Install] sections, which are described in systemd.unit(5).
 *
 * Swap unit files must include a [Swap] section, which carries information about the swap device it supervises. A number of options that may be used in this section are
 *
 * shared with other unit types. These options are documented in systemd.exec(5) and systemd.kill(5). The options specific to the [Swap] section of swap units are the
 *
 * following:
 *
 */
export interface ISwapOptions {
	/**
	 * Takes an absolute path of a device node or file to use for paging. See swapon(8) for details. If this refers to a device node, a dependency on the respective device
	 *
	 * unit is automatically created. (See systemd.device(5) for more information.) If this refers to a file, a dependency on the respective mount unit is automatically
	 *
	 * created. (See systemd.mount(5) for more information.) This option is mandatory. Note that the usual specifier expansion is applied to this setting, literal percent
	 *
	 * characters should hence be written as "%%".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.swap.html#What=
	 */
	What: MaybeArray<string>;
	/**
	 * Swap priority to use when activating the swap device or file. This takes an integer. This setting is optional and ignored when the priority is set by pri= in the
	 *
	 * Options= key.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.swap.html#Priority=
	 */
	Priority: MaybeArray<string>;
	/**
	 * May contain an option string for the swap device. This may be used for controlling discard options among other functionality, if the swap backing device supports
	 *
	 * the discard or trim operation. (See swapon(8) for more information.) Note that the usual specifier expansion is applied to this setting, literal percent characters
	 *
	 * should hence be written as "%%".
	 *
	 * Added in version 217.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.swap.html#Options=
	 */
	Options: MaybeArray<string>;
	/**
	 * Configures the time to wait for the swapon command to finish. If a command does not exit within the configured time, the swap will be considered failed and be shut
	 *
	 * down again. All commands still running will be terminated forcibly via SIGTERM, and after another delay of this time with SIGKILL. (See KillMode= in
	 *
	 * systemd.kill(5).) Takes a unit-less value in seconds, or a time span value such as "5min 20s". Pass "0" to disable the timeout logic. Defaults to
	 *
	 * DefaultTimeoutStartSec= from the manager configuration file (see systemd-system.conf(5)).
	 *
	 * Check systemd.unit(5), systemd.exec(5), and systemd.kill(5) for more settings.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.swap.html#TimeoutSec=
	 */
	TimeoutSec: string | number;
}
export interface ISwapUnit {
	Swap: ISwapOptions;
}
