// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IResourceControlSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#CPUAccounting= */
	CPUAccounting?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#CPUWeight= */
	CPUWeight?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#CPUWeight= */
	StartupCPUWeight?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#CPUQuota= */
	CPUQuota?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#CPUQuotaPeriodSec= */
	CPUQuotaPeriodSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#AllowedCPUs= */
	AllowedCPUs?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#AllowedCPUs= */
	StartupAllowedCPUs?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#AllowedMemoryNodes= */
	AllowedMemoryNodes?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#AllowedMemoryNodes= */
	StartupAllowedMemoryNodes?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#MemoryAccounting= */
	MemoryAccounting?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#MemoryMin= */
	MemoryMin?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#MemoryMin= */
	MemoryLow?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#MemoryHigh= */
	MemoryHigh?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#MemoryMax= */
	MemoryMax?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#MemorySwapMax= */
	MemorySwapMax?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#MemoryZSwapMax= */
	MemoryZSwapMax?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#TasksAccounting= */
	TasksAccounting?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#TasksMax= */
	TasksMax?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#IOAccounting= */
	IOAccounting?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#IOWeight= */
	IOWeight?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#IOWeight= */
	StartupIOWeight?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#IPAccounting= */
	IPAccounting?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#IPAddressAllow= */
	IPAddressAllow?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#IPAddressAllow= */
	IPAddressDeny?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#IPIngressFilterPath= */
	IPIngressFilterPath?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#IPIngressFilterPath= */
	IPEgressFilterPath?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#BPFProgram= */
	BPFProgram?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#SocketBindAllow= */
	SocketBindAllow?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#SocketBindAllow= */
	SocketBindDeny?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#RestrictNetworkInterfaces= */
	RestrictNetworkInterfaces?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#DeviceAllow= */
	DeviceAllow?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#DevicePolicy= */
	DevicePolicy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#Slice= */
	Slice?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#Delegate= */
	Delegate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#DisableControllers= */
	DisableControllers?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#ManagedOOMSwap= */
	ManagedOOMSwap?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#ManagedOOMSwap= */
	ManagedOOMMemoryPressure?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#ManagedOOMMemoryPressureLimit= */
	ManagedOOMMemoryPressureLimit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#ManagedOOMPreference= */
	ManagedOOMPreference?: MaybeArray<string>;
}

export const resourceControlFields: readonly string[] = [
	'CPUAccounting',
	'CPUWeight',
	'StartupCPUWeight',
	'CPUQuota',
	'CPUQuotaPeriodSec',
	'AllowedCPUs',
	'StartupAllowedCPUs',
	'AllowedMemoryNodes',
	'StartupAllowedMemoryNodes',
	'MemoryAccounting',
	'MemoryMin',
	'MemoryLow',
	'MemoryHigh',
	'MemoryMax',
	'MemorySwapMax',
	'MemoryZSwapMax',
	'TasksAccounting',
	'TasksMax',
	'IOAccounting',
	'IOWeight',
	'StartupIOWeight',
	'IPAccounting',
	'IPAddressAllow',
	'IPAddressDeny',
	'IPIngressFilterPath',
	'IPEgressFilterPath',
	'BPFProgram',
	'SocketBindAllow',
	'SocketBindDeny',
	'RestrictNetworkInterfaces',
	'DeviceAllow',
	'DevicePolicy',
	'Slice',
	'Delegate',
	'DisableControllers',
	'ManagedOOMSwap',
	'ManagedOOMMemoryPressure',
	'ManagedOOMMemoryPressureLimit',
	'ManagedOOMPreference',
];
