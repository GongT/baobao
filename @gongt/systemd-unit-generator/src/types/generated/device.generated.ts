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
 * Unit settings of device units may either be configured via unit files, or directly from the udev database. The following udev device properties are understood by the
 *
 * service manager:
 *
 */
export interface IDeviceTheUdevDatabaseOptions {
	/**
	 * Adds dependencies of type Wants= from the device unit to the specified units.  SYSTEMD_WANTS= is read by the system service manager, SYSTEMD_USER_WANTS= by user
	 *
	 * service manager instances. These properties may be used to activate arbitrary units when a specific device becomes available.
	 *
	 * Note that this and the other udev device properties are not taken into account unless the device is tagged with the "systemd" tag in the udev database, because
	 *
	 * otherwise the device is not exposed as a systemd unit (see above).
	 *
	 * Note that systemd will only act on Wants= dependencies when a device first becomes active. It will not act on them if they are added to devices that are already
	 *
	 * active. Use SYSTEMD_READY= (see below) to configure when a udev device shall be considered active, and thus when to trigger the dependencies.
	 *
	 * The specified property value should be a space-separated list of valid unit names. If a unit template name is specified (that is, a unit name containing an "@"
	 *
	 * character indicating a unit name to use for multiple instantiation, but with an empty instance name following the "@"), it will be automatically instantiated by the
	 *
	 * device's "sysfs" path (that is: the path is escaped and inserted as instance name into the template unit name). This is useful in order to instantiate a specific
	 *
	 * template unit once for each device that appears and matches specific properties.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#SYSTEMD_WANTS=
	 */
	SYSTEMD_WANTS: MaybeArray<string>;
	/**
	 * Adds dependencies of type Wants= from the device unit to the specified units.  SYSTEMD_WANTS= is read by the system service manager, SYSTEMD_USER_WANTS= by user
	 *
	 * service manager instances. These properties may be used to activate arbitrary units when a specific device becomes available.
	 *
	 * Note that this and the other udev device properties are not taken into account unless the device is tagged with the "systemd" tag in the udev database, because
	 *
	 * otherwise the device is not exposed as a systemd unit (see above).
	 *
	 * Note that systemd will only act on Wants= dependencies when a device first becomes active. It will not act on them if they are added to devices that are already
	 *
	 * active. Use SYSTEMD_READY= (see below) to configure when a udev device shall be considered active, and thus when to trigger the dependencies.
	 *
	 * The specified property value should be a space-separated list of valid unit names. If a unit template name is specified (that is, a unit name containing an "@"
	 *
	 * character indicating a unit name to use for multiple instantiation, but with an empty instance name following the "@"), it will be automatically instantiated by the
	 *
	 * device's "sysfs" path (that is: the path is escaped and inserted as instance name into the template unit name). This is useful in order to instantiate a specific
	 *
	 * template unit once for each device that appears and matches specific properties.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#SYSTEMD_WANTS=
	 */
	SYSTEMD_USER_WANTS: MaybeArray<string>;
	/**
	 * Adds an additional alias name to the device unit. This must be an absolute path that is automatically transformed into a unit name. (See above.)
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#SYSTEMD_ALIAS=
	 */
	SYSTEMD_ALIAS: MaybeArray<string>;
	/**
	 * If set to 0, systemd will consider this device unplugged even if it shows up in the udev tree. If this property is unset or set to 1, the device will be considered
	 *
	 * plugged if it is visible in the udev tree.
	 *
	 * This option is useful for devices that initially show up in an uninitialized state in the tree, and for which a "changed" event is generated the moment they are
	 *
	 * fully set up. Note that SYSTEMD_WANTS= (see above) is not acted on as long as SYSTEMD_READY=0 is set for a device.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#SYSTEMD_READY=
	 */
	SYSTEMD_READY: MaybeArray<string>;
	/**
	 * If set, this property is used as description string for the device unit.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#ID_MODEL_FROM_DATABASE=
	 */
	ID_MODEL_FROM_DATABASE: MaybeArray<string>;
	/**
	 * If set, this property is used as description string for the device unit.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.device.html#ID_MODEL_FROM_DATABASE=
	 */
	ID_MODEL: MaybeArray<string>;
}
export interface IDeviceUnit {
	TheUdevDatabase: IDeviceTheUdevDatabaseOptions;
}
