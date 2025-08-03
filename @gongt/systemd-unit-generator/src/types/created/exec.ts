// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IExecPathsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ExecSearchPath= */
	ExecSearchPath?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#WorkingDirectory= */
	WorkingDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RootDirectory= */
	RootDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RootImage= */
	RootImage?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RootImageOptions= */
	RootImageOptions?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RootHash= */
	RootHash?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RootHashSignature= */
	RootHashSignature?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RootVerity= */
	RootVerity?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#MountAPIVFS= */
	MountAPIVFS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ProtectProc= */
	ProtectProc?: 'noaccess' | 'invisible' | 'ptraceable' | 'default' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ProcSubset= */
	ProcSubset?: 'all' | 'pid' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#BindPaths= */
	BindPaths?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#BindPaths= */
	BindReadOnlyPaths?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#MountImages= */
	MountImages?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ExtensionImages= */
	ExtensionImages?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ExtensionDirectories= */
	ExtensionDirectories?: MaybeArray<string>;
}

export const execPathsFields: readonly string[] = [
	'ExecSearchPath',
	'WorkingDirectory',
	'RootDirectory',
	'RootImage',
	'RootImageOptions',
	'RootHash',
	'RootHashSignature',
	'RootVerity',
	'MountAPIVFS',
	'ProtectProc',
	'ProcSubset',
	'BindPaths',
	'BindReadOnlyPaths',
	'MountImages',
	'ExtensionImages',
	'ExtensionDirectories',
];

export interface IExecUserGroupIdentityOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#User= */
	User?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#User= */
	Group?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#DynamicUser= */
	DynamicUser?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SupplementaryGroups= */
	SupplementaryGroups?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#PAMName= */
	PAMName?: MaybeArray<string>;
}

export const execUserGroupIdentityFields: readonly string[] = ['User', 'Group', 'DynamicUser', 'SupplementaryGroups', 'PAMName'];

export interface IExecCapabilitiesOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#CapabilityBoundingSet= */
	CapabilityBoundingSet?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#AmbientCapabilities= */
	AmbientCapabilities?: MaybeArray<string>;
}

export const execCapabilitiesFields: readonly string[] = ['CapabilityBoundingSet', 'AmbientCapabilities'];

export interface IExecSecurityOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#NoNewPrivileges= */
	NoNewPrivileges?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SecureBits= */
	SecureBits?: MaybeArray<string>;
}

export const execSecurityFields: readonly string[] = ['NoNewPrivileges', 'SecureBits'];

export interface IExecMandatoryAccessControlOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SELinuxContext= */
	SELinuxContext?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#AppArmorProfile= */
	AppArmorProfile?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SmackProcessLabel= */
	SmackProcessLabel?: MaybeArray<string>;
}

export const execMandatoryAccessControlFields: readonly string[] = ['SELinuxContext', 'AppArmorProfile', 'SmackProcessLabel'];

export interface IExecProcessPropertiesOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitCPU?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitFSIZE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitDATA?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitSTACK?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitCORE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitRSS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitNOFILE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitAS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitNPROC?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitMEMLOCK?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitLOCKS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitSIGPENDING?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitMSGQUEUE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitCPU= */
	LimitNICE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitRTPRIO= */
	LimitRTPRIO?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LimitRTPRIO= */
	LimitRTTIME?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#UMask= */
	UMask?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#CoredumpFilter= */
	CoredumpFilter?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#KeyringMode= */
	KeyringMode?: 'inherit' | 'private' | 'shared' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#OOMScoreAdjust= */
	OOMScoreAdjust?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#TimerSlackNSec= */
	TimerSlackNSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#Personality= */
	Personality?: 'the' | 'architecture' | 'identifiers' | 'arm64' | 'arm64-be' | 'arm' | 'arm-be' | 'x86' | 'x86-64' | 'ppc' | 'ppc-le' | 'ppc64' | 'ppc64-le' | 's390' | 's390x' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#IgnoreSIGPIPE= */
	IgnoreSIGPIPE?: MaybeArray<string>;
}

export const execProcessPropertiesFields: readonly string[] = [
	'LimitCPU',
	'LimitFSIZE',
	'LimitDATA',
	'LimitSTACK',
	'LimitCORE',
	'LimitRSS',
	'LimitNOFILE',
	'LimitAS',
	'LimitNPROC',
	'LimitMEMLOCK',
	'LimitLOCKS',
	'LimitSIGPENDING',
	'LimitMSGQUEUE',
	'LimitNICE',
	'LimitRTPRIO',
	'LimitRTTIME',
	'UMask',
	'CoredumpFilter',
	'KeyringMode',
	'OOMScoreAdjust',
	'TimerSlackNSec',
	'Personality',
	'IgnoreSIGPIPE',
];

export interface IExecSchedulingOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#Nice= */
	Nice?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#CPUSchedulingPolicy= */
	CPUSchedulingPolicy?: 'other' | 'batch' | 'idle' | 'fifo' | 'rr' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#CPUSchedulingPriority= */
	CPUSchedulingPriority?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#CPUSchedulingResetOnFork= */
	CPUSchedulingResetOnFork?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#CPUAffinity= */
	CPUAffinity?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#NUMAPolicy= */
	NUMAPolicy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#NUMAMask= */
	NUMAMask?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#IOSchedulingClass= */
	IOSchedulingClass?: 'the' | 'strings' | 'realtime' | 'best-effort' | 'idle' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#IOSchedulingPriority= */
	IOSchedulingPriority?: MaybeArray<string>;
}

export const execSchedulingFields: readonly string[] = ['Nice', 'CPUSchedulingPolicy', 'CPUSchedulingPriority', 'CPUSchedulingResetOnFork', 'CPUAffinity', 'NUMAPolicy', 'NUMAMask', 'IOSchedulingClass', 'IOSchedulingPriority'];

export interface IExecSandboxingOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ProtectSystem= */
	ProtectSystem?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ProtectHome= */
	ProtectHome?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectory= */
	RuntimeDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectory= */
	StateDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectory= */
	CacheDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectory= */
	LogsDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectory= */
	ConfigurationDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectoryMode= */
	RuntimeDirectoryMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectoryMode= */
	StateDirectoryMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectoryMode= */
	CacheDirectoryMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectoryMode= */
	LogsDirectoryMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectoryMode= */
	ConfigurationDirectoryMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RuntimeDirectoryPreserve= */
	RuntimeDirectoryPreserve?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#TimeoutCleanSec= */
	TimeoutCleanSec?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ReadWritePaths= */
	ReadWritePaths?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ReadWritePaths= */
	ReadOnlyPaths?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ReadWritePaths= */
	InaccessiblePaths?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ReadWritePaths= */
	ExecPaths?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ReadWritePaths= */
	NoExecPaths?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#TemporaryFileSystem= */
	TemporaryFileSystem?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#PrivateTmp= */
	PrivateTmp?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#PrivateDevices= */
	PrivateDevices?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#PrivateNetwork= */
	PrivateNetwork?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#NetworkNamespacePath= */
	NetworkNamespacePath?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#PrivateIPC= */
	PrivateIPC?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#IPCNamespacePath= */
	IPCNamespacePath?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#PrivateUsers= */
	PrivateUsers?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ProtectHostname= */
	ProtectHostname?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ProtectClock= */
	ProtectClock?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ProtectKernelTunables= */
	ProtectKernelTunables?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ProtectKernelModules= */
	ProtectKernelModules?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ProtectKernelLogs= */
	ProtectKernelLogs?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#ProtectControlGroups= */
	ProtectControlGroups?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RestrictAddressFamilies= */
	RestrictAddressFamilies?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RestrictFileSystems= */
	RestrictFileSystems?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RestrictNamespaces= */
	RestrictNamespaces?: MaybeArray<BooleanType>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LockPersonality= */
	LockPersonality?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#MemoryDenyWriteExecute= */
	MemoryDenyWriteExecute?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RestrictRealtime= */
	RestrictRealtime?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RestrictSUIDSGID= */
	RestrictSUIDSGID?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#RemoveIPC= */
	RemoveIPC?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#PrivateMounts= */
	PrivateMounts?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#MountFlags= */
	MountFlags?: MaybeArray<string>;
}

export const execSandboxingFields: readonly string[] = [
	'ProtectSystem',
	'ProtectHome',
	'RuntimeDirectory',
	'StateDirectory',
	'CacheDirectory',
	'LogsDirectory',
	'ConfigurationDirectory',
	'RuntimeDirectoryMode',
	'StateDirectoryMode',
	'CacheDirectoryMode',
	'LogsDirectoryMode',
	'ConfigurationDirectoryMode',
	'RuntimeDirectoryPreserve',
	'TimeoutCleanSec',
	'ReadWritePaths',
	'ReadOnlyPaths',
	'InaccessiblePaths',
	'ExecPaths',
	'NoExecPaths',
	'TemporaryFileSystem',
	'PrivateTmp',
	'PrivateDevices',
	'PrivateNetwork',
	'NetworkNamespacePath',
	'PrivateIPC',
	'IPCNamespacePath',
	'PrivateUsers',
	'ProtectHostname',
	'ProtectClock',
	'ProtectKernelTunables',
	'ProtectKernelModules',
	'ProtectKernelLogs',
	'ProtectControlGroups',
	'RestrictAddressFamilies',
	'RestrictFileSystems',
	'RestrictNamespaces',
	'LockPersonality',
	'MemoryDenyWriteExecute',
	'RestrictRealtime',
	'RestrictSUIDSGID',
	'RemoveIPC',
	'PrivateMounts',
	'MountFlags',
];

export interface IExecSystemCallFilteringOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SystemCallFilter= */
	SystemCallFilter?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SystemCallErrorNumber= */
	SystemCallErrorNumber?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SystemCallArchitectures= */
	SystemCallArchitectures?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SystemCallLog= */
	SystemCallLog?: MaybeArray<string>;
}

export const execSystemCallFilteringFields: readonly string[] = ['SystemCallFilter', 'SystemCallErrorNumber', 'SystemCallArchitectures', 'SystemCallLog'];

export interface IExecEnvironmentOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#Environment= */
	Environment?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#EnvironmentFile= */
	EnvironmentFile?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#PassEnvironment= */
	PassEnvironment?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#UnsetEnvironment= */
	UnsetEnvironment?: MaybeArray<string>;
}

export const execEnvironmentFields: readonly string[] = ['Environment', 'EnvironmentFile', 'PassEnvironment', 'UnsetEnvironment'];

export interface IExecLoggingAndStandardInputOutputOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#StandardInput= */
	StandardInput?: 'null' | 'tty' | 'tty-force' | 'tty-fail' | 'data' | 'file:path' | 'socket' | 'fd:name' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#StandardOutput= */
	StandardOutput?: 'inherit' | 'null' | 'tty' | 'journal' | 'kmsg' | 'journal+console' | 'kmsg+console' | 'file:path' | 'append:path' | 'truncate:path' | 'socket' | 'fd:name' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#StandardError= */
	StandardError?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#StandardInputText= */
	StandardInputText?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#StandardInputText= */
	StandardInputData?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LogLevelMax= */
	LogLevelMax?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LogExtraFields= */
	LogExtraFields?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LogRateLimitIntervalSec= */
	LogRateLimitIntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LogRateLimitIntervalSec= */
	LogRateLimitBurst?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LogFilterPatterns= */
	LogFilterPatterns?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LogNamespace= */
	LogNamespace?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SyslogIdentifier= */
	SyslogIdentifier?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SyslogFacility= */
	SyslogFacility?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SyslogLevel= */
	SyslogLevel?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SyslogLevelPrefix= */
	SyslogLevelPrefix?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#TTYPath= */
	TTYPath?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#TTYReset= */
	TTYReset?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#TTYVHangup= */
	TTYVHangup?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#TTYRows= */
	TTYRows?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#TTYRows= */
	TTYColumns?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#TTYVTDisallocate= */
	TTYVTDisallocate?: MaybeArray<string>;
}

export const execLoggingAndStandardInputOutputFields: readonly string[] = [
	'StandardInput',
	'StandardOutput',
	'StandardError',
	'StandardInputText',
	'StandardInputData',
	'LogLevelMax',
	'LogExtraFields',
	'LogRateLimitIntervalSec',
	'LogRateLimitBurst',
	'LogFilterPatterns',
	'LogNamespace',
	'SyslogIdentifier',
	'SyslogFacility',
	'SyslogLevel',
	'SyslogLevelPrefix',
	'TTYPath',
	'TTYReset',
	'TTYVHangup',
	'TTYRows',
	'TTYColumns',
	'TTYVTDisallocate',
];

export interface IExecCredentialsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LoadCredential= */
	LoadCredential?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#LoadCredential= */
	LoadCredentialEncrypted?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SetCredential= */
	SetCredential?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SetCredential= */
	SetCredentialEncrypted?: MaybeArray<string>;
}

export const execCredentialsFields: readonly string[] = ['LoadCredential', 'LoadCredentialEncrypted', 'SetCredential', 'SetCredentialEncrypted'];

export interface IExecSystemVCompatibilityOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#UtmpIdentifier= */
	UtmpIdentifier?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.exec.html#UtmpMode= */
	UtmpMode?: 'init' | 'login' | 'user' | string;
}

export const execSystemVCompatibilityFields: readonly string[] = ['UtmpIdentifier', 'UtmpMode'];

export type __IExecAll = IExecPathsOptions &
	IExecUserGroupIdentityOptions &
	IExecCapabilitiesOptions &
	IExecSecurityOptions &
	IExecMandatoryAccessControlOptions &
	IExecProcessPropertiesOptions &
	IExecSchedulingOptions &
	IExecSandboxingOptions &
	IExecSystemCallFilteringOptions &
	IExecEnvironmentOptions &
	IExecLoggingAndStandardInputOutputOptions &
	IExecCredentialsOptions &
	IExecSystemVCompatibilityOptions;
