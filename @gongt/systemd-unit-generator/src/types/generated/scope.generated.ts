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
 * Scope files may include a [Unit] section, which is described in systemd.unit(5).
 *
 * Scope files may include a [Scope] section, which carries information about the scope and the units it contains. A number of options that may be used in this section are
 *
 * shared with other unit types. These options are documented in systemd.kill(5) and systemd.resource-control(5). The options specific to the [Scope] section of scope
 *
 * units are the following:
 *
 */
export interface IScopeOptions {
	/**
	 * Configure the out-of-memory (OOM) killing policy for the kernel and the userspace OOM killer systemd-oomd.service(8). On Linux, when memory becomes scarce to the
	 *
	 * point that the kernel has trouble allocating memory for itself, it might decide to kill a running process in order to free up memory and reduce memory pressure.
	 *
	 * Note that systemd-oomd.service is a more flexible solution that aims to prevent out-of-memory situations for the userspace too, not just the kernel, by attempting
	 *
	 * to terminate services earlier, before the kernel would have to act.
	 *
	 * This setting takes one of continue, stop or kill. If set to continue and a process in the unit is killed by the OOM killer, this is logged but the unit continues
	 *
	 * running. If set to stop the event is logged but the unit is terminated cleanly by the service manager. If set to kill and one of the unit's processes is killed by
	 *
	 * the OOM killer the kernel is instructed to kill all remaining processes of the unit too, by setting the memory.oom.group attribute to 1; also see kernel page
	 *
	 * Control Group v2[2].
	 *
	 * Defaults to the setting DefaultOOMPolicy= in systemd-system.conf(5) is set to, except for units where Delegate= is turned on, where it defaults to continue.
	 *
	 * Use the OOMScoreAdjust= setting to configure whether processes of the unit shall be considered preferred or less preferred candidates for process termination by the
	 *
	 * Linux OOM killer logic. See systemd.exec(5) for details.
	 *
	 * This setting also applies to systemd-oomd.service(8). Similarly to the kernel OOM kills performed by the kernel, this setting determines the state of the unit after
	 *
	 * systemd-oomd kills a cgroup associated with it.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.scope.html#OOMPolicy=
	 */
	OOMPolicy: "continue" | "stop" | "kill" | string;
	/**
	 * Configures a maximum time for the scope to run. If this is used and the scope has been active for longer than the specified time it is terminated and put into a
	 *
	 * failure state. Pass "infinity" (the default) to configure no runtime limit.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.scope.html#RuntimeMaxSec=
	 */
	RuntimeMaxSec: MaybeArray<string>;
	/**
	 * This option modifies RuntimeMaxSec= by increasing the maximum runtime by an evenly distributed duration between 0 and the specified value (in seconds). If
	 *
	 * RuntimeMaxSec= is unspecified, then this feature will be disabled.
	 *
	 * Added in version 250.
	 *
	 * Check systemd.unit(5), systemd.exec(5), and systemd.kill(5) for more settings.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.scope.html#RuntimeRandomizedExtraSec=
	 */
	RuntimeRandomizedExtraSec: MaybeArray<string>;
}
export interface IScopeUnit {
	Scope: IScopeOptions;
}
