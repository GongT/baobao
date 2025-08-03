// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IUnitUnitSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Description= */
	Description?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Documentation= */
	Documentation?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Wants= */
	Wants?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Requires= */
	Requires?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Requisite= */
	Requisite?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#BindsTo= */
	BindsTo?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#PartOf= */
	PartOf?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Upholds= */
	Upholds?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Conflicts= */
	Conflicts?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Before= */
	Before?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Before= */
	After?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#OnFailure= */
	OnFailure?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#OnSuccess= */
	OnSuccess?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#PropagatesReloadTo= */
	PropagatesReloadTo?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#PropagatesReloadTo= */
	ReloadPropagatedFrom?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#PropagatesStopTo= */
	PropagatesStopTo?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#PropagatesStopTo= */
	StopPropagatedFrom?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#JoinsNamespaceOf= */
	JoinsNamespaceOf?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#RequiresMountsFor= */
	RequiresMountsFor?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#OnFailureJobMode= */
	OnFailureJobMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#IgnoreOnIsolate= */
	IgnoreOnIsolate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#StopWhenUnneeded= */
	StopWhenUnneeded?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#RefuseManualStart= */
	RefuseManualStart?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#RefuseManualStart= */
	RefuseManualStop?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AllowIsolate= */
	AllowIsolate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#DefaultDependencies= */
	DefaultDependencies?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#CollectMode= */
	CollectMode?: 'inactive' | 'inactive-or-failed' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#FailureAction= */
	FailureAction?: 'none' | 'reboot' | 'reboot-force' | 'reboot-immediate' | 'poweroff' | 'poweroff-force' | 'poweroff-immediate' | 'exit' | 'exit-force' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#FailureAction= */
	SuccessAction?: 'none' | 'reboot' | 'reboot-force' | 'reboot-immediate' | 'poweroff' | 'poweroff-force' | 'poweroff-immediate' | 'exit' | 'exit-force' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#FailureActionExitStatus= */
	FailureActionExitStatus?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#FailureActionExitStatus= */
	SuccessActionExitStatus?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#JobTimeoutSec= */
	JobTimeoutSec?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#JobTimeoutSec= */
	JobRunningTimeoutSec?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#JobTimeoutAction= */
	JobTimeoutAction?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#JobTimeoutAction= */
	JobTimeoutRebootArgument?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#StartLimitIntervalSec= */
	StartLimitIntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#StartLimitIntervalSec= */
	StartLimitBurst?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#StartLimitAction= */
	StartLimitAction?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#RebootArgument= */
	RebootArgument?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#SourcePath= */
	SourcePath?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionArchitecture= */
	ConditionArchitecture?:
		| 'x86'
		| 'x86-64'
		| 'ppc'
		| 'ppc-le'
		| 'ppc64'
		| 'ppc64-le'
		| 'ia64'
		| 'parisc'
		| 'parisc64'
		| 's390'
		| 's390x'
		| 'sparc'
		| 'sparc64'
		| 'mips'
		| 'mips-le'
		| 'mips64'
		| 'mips64-le'
		| 'alpha'
		| 'arm'
		| 'arm-be'
		| 'arm64'
		| 'arm64-be'
		| 'sh'
		| 'sh64'
		| 'm68k'
		| 'tilegx'
		| 'cris'
		| 'arc'
		| 'arc-be'
		| 'native'
		| string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionFirmware= */
	ConditionFirmware?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionVirtualization= */
	ConditionVirtualization?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionHost= */
	ConditionHost?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionKernelCommandLine= */
	ConditionKernelCommandLine?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionKernelVersion= */
	ConditionKernelVersion?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionCredential= */
	ConditionCredential?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionEnvironment= */
	ConditionEnvironment?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionSecurity= */
	ConditionSecurity?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionCapability= */
	ConditionCapability?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionACPower= */
	ConditionACPower?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionNeedsUpdate= */
	ConditionNeedsUpdate?: '/var/' | '/etc/' | 'as' | 'argument' | 'possibly' | 'prefixed' | 'with' | 'a' | '!' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionFirstBoot= */
	ConditionFirstBoot?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathExists= */
	ConditionPathExists?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathExistsGlob= */
	ConditionPathExistsGlob?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathIsDirectory= */
	ConditionPathIsDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathIsSymbolicLink= */
	ConditionPathIsSymbolicLink?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathIsMountPoint= */
	ConditionPathIsMountPoint?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathIsReadWrite= */
	ConditionPathIsReadWrite?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathIsEncrypted= */
	ConditionPathIsEncrypted?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionDirectoryNotEmpty= */
	ConditionDirectoryNotEmpty?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionFileNotEmpty= */
	ConditionFileNotEmpty?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionFileIsExecutable= */
	ConditionFileIsExecutable?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionUser= */
	ConditionUser?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionGroup= */
	ConditionGroup?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionControlGroupController= */
	ConditionControlGroupController?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionMemory= */
	ConditionMemory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionCPUs= */
	ConditionCPUs?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionCPUFeature= */
	ConditionCPUFeature?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionOSRelease= */
	ConditionOSRelease?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionMemoryPressure= */
	ConditionMemoryPressure?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionMemoryPressure= */
	ConditionCPUPressure?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionMemoryPressure= */
	ConditionIOPressure?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture= */
	AssertArchitecture?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture= */
	AssertVirtualization?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture= */
	AssertHost?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture= */
	AssertKernelCommandLine?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture= */
	AssertKernelVersion?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture= */
	AssertCredential?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture= */
	AssertEnvironment?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture= */
	AssertSecurity?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture= */
	AssertCapability?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertACPower= */
	AssertACPower?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertACPower= */
	AssertNeedsUpdate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertACPower= */
	AssertFirstBoot?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertACPower= */
	AssertPathExists?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertACPower= */
	AssertPathExistsGlob?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertACPower= */
	AssertPathIsDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertACPower= */
	AssertPathIsSymbolicLink?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertACPower= */
	AssertPathIsMountPoint?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertPathIsReadWrite= */
	AssertPathIsReadWrite?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertPathIsReadWrite= */
	AssertPathIsEncrypted?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertPathIsReadWrite= */
	AssertDirectoryNotEmpty?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertPathIsReadWrite= */
	AssertFileNotEmpty?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertPathIsReadWrite= */
	AssertFileIsExecutable?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertPathIsReadWrite= */
	AssertUser?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertPathIsReadWrite= */
	AssertGroup?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertPathIsReadWrite= */
	AssertControlGroupController?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertMemory= */
	AssertMemory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertMemory= */
	AssertCPUs?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertMemory= */
	AssertCPUFeature?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertMemory= */
	AssertOSRelease?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertMemory= */
	AssertMemoryPressure?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertMemory= */
	AssertCPUPressure?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertMemory= */
	AssertIOPressure?: MaybeArray<string>;
}

export const unitUnitFields: readonly string[] = [
	'Description',
	'Documentation',
	'Wants',
	'Requires',
	'Requisite',
	'BindsTo',
	'PartOf',
	'Upholds',
	'Conflicts',
	'Before',
	'After',
	'OnFailure',
	'OnSuccess',
	'PropagatesReloadTo',
	'ReloadPropagatedFrom',
	'PropagatesStopTo',
	'StopPropagatedFrom',
	'JoinsNamespaceOf',
	'RequiresMountsFor',
	'OnFailureJobMode',
	'IgnoreOnIsolate',
	'StopWhenUnneeded',
	'RefuseManualStart',
	'RefuseManualStop',
	'AllowIsolate',
	'DefaultDependencies',
	'CollectMode',
	'FailureAction',
	'SuccessAction',
	'FailureActionExitStatus',
	'SuccessActionExitStatus',
	'JobTimeoutSec',
	'JobRunningTimeoutSec',
	'JobTimeoutAction',
	'JobTimeoutRebootArgument',
	'StartLimitIntervalSec',
	'StartLimitBurst',
	'StartLimitAction',
	'RebootArgument',
	'SourcePath',
	'ConditionArchitecture',
	'ConditionFirmware',
	'ConditionVirtualization',
	'ConditionHost',
	'ConditionKernelCommandLine',
	'ConditionKernelVersion',
	'ConditionCredential',
	'ConditionEnvironment',
	'ConditionSecurity',
	'ConditionCapability',
	'ConditionACPower',
	'ConditionNeedsUpdate',
	'ConditionFirstBoot',
	'ConditionPathExists',
	'ConditionPathExistsGlob',
	'ConditionPathIsDirectory',
	'ConditionPathIsSymbolicLink',
	'ConditionPathIsMountPoint',
	'ConditionPathIsReadWrite',
	'ConditionPathIsEncrypted',
	'ConditionDirectoryNotEmpty',
	'ConditionFileNotEmpty',
	'ConditionFileIsExecutable',
	'ConditionUser',
	'ConditionGroup',
	'ConditionControlGroupController',
	'ConditionMemory',
	'ConditionCPUs',
	'ConditionCPUFeature',
	'ConditionOSRelease',
	'ConditionMemoryPressure',
	'ConditionCPUPressure',
	'ConditionIOPressure',
	'AssertArchitecture',
	'AssertVirtualization',
	'AssertHost',
	'AssertKernelCommandLine',
	'AssertKernelVersion',
	'AssertCredential',
	'AssertEnvironment',
	'AssertSecurity',
	'AssertCapability',
	'AssertACPower',
	'AssertNeedsUpdate',
	'AssertFirstBoot',
	'AssertPathExists',
	'AssertPathExistsGlob',
	'AssertPathIsDirectory',
	'AssertPathIsSymbolicLink',
	'AssertPathIsMountPoint',
	'AssertPathIsReadWrite',
	'AssertPathIsEncrypted',
	'AssertDirectoryNotEmpty',
	'AssertFileNotEmpty',
	'AssertFileIsExecutable',
	'AssertUser',
	'AssertGroup',
	'AssertControlGroupController',
	'AssertMemory',
	'AssertCPUs',
	'AssertCPUFeature',
	'AssertOSRelease',
	'AssertMemoryPressure',
	'AssertCPUPressure',
	'AssertIOPressure',
];

export interface IUnitInstallSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Alias= */
	Alias?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#WantedBy= */
	WantedBy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#WantedBy= */
	RequiredBy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Also= */
	Also?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#DefaultInstance= */
	DefaultInstance?: MaybeArray<string>;
}

export const unitInstallFields: readonly string[] = ['Alias', 'WantedBy', 'RequiredBy', 'Also', 'DefaultInstance'];

export type __IUnitAll = IUnitUnitSection & IUnitInstallSection;
