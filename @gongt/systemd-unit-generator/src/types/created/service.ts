// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IServiceSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#Type= */
	Type?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#ExitType= */
	ExitType?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#RemainAfterExit= */
	RemainAfterExit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#GuessMainPID= */
	GuessMainPID?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#PIDFile= */
	PIDFile?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#BusName= */
	BusName?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#ExecStart= */
	ExecStart?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#ExecStartPre= */
	ExecStartPre?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#ExecStartPre= */
	ExecStartPost?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#ExecCondition= */
	ExecCondition?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#ExecReload= */
	ExecReload?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#ExecStop= */
	ExecStop?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#ExecStopPost= */
	ExecStopPost?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#RestartSec= */
	RestartSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#TimeoutStartSec= */
	TimeoutStartSec?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#TimeoutStopSec= */
	TimeoutStopSec?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#TimeoutAbortSec= */
	TimeoutAbortSec?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#TimeoutSec= */
	TimeoutSec?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#TimeoutStartFailureMode= */
	TimeoutStartFailureMode?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#TimeoutStartFailureMode= */
	TimeoutStopFailureMode?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#RuntimeMaxSec= */
	RuntimeMaxSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#RuntimeRandomizedExtraSec= */
	RuntimeRandomizedExtraSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#WatchdogSec= */
	WatchdogSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#Restart= */
	Restart?: 'no' | 'on-success' | 'on-failure' | 'on-abnormal' | 'on-watchdog' | 'on-abort' | 'always' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#SuccessExitStatus= */
	SuccessExitStatus?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#RestartPreventExitStatus= */
	RestartPreventExitStatus?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#RestartForceExitStatus= */
	RestartForceExitStatus?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#RootDirectoryStartOnly= */
	RootDirectoryStartOnly?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#NonBlocking= */
	NonBlocking?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#NotifyAccess= */
	NotifyAccess?: 'none' | 'main' | 'exec' | 'all' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#Sockets= */
	Sockets?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#FileDescriptorStoreMax= */
	FileDescriptorStoreMax?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#USBFunctionDescriptors= */
	USBFunctionDescriptors?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#USBFunctionStrings= */
	USBFunctionStrings?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#OOMPolicy= */
	OOMPolicy?: 'continue' | 'stop' | 'kill' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#OpenFile= */
	OpenFile?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.service.html#ReloadSignal= */
	ReloadSignal?: MaybeArray<string>;
}

export const serviceFields: readonly string[] = [
	'Type',
	'ExitType',
	'RemainAfterExit',
	'GuessMainPID',
	'PIDFile',
	'BusName',
	'ExecStart',
	'ExecStartPre',
	'ExecStartPost',
	'ExecCondition',
	'ExecReload',
	'ExecStop',
	'ExecStopPost',
	'RestartSec',
	'TimeoutStartSec',
	'TimeoutStopSec',
	'TimeoutAbortSec',
	'TimeoutSec',
	'TimeoutStartFailureMode',
	'TimeoutStopFailureMode',
	'RuntimeMaxSec',
	'RuntimeRandomizedExtraSec',
	'WatchdogSec',
	'Restart',
	'SuccessExitStatus',
	'RestartPreventExitStatus',
	'RestartForceExitStatus',
	'RootDirectoryStartOnly',
	'NonBlocking',
	'NotifyAccess',
	'Sockets',
	'FileDescriptorStoreMax',
	'USBFunctionDescriptors',
	'USBFunctionStrings',
	'OOMPolicy',
	'OpenFile',
	'ReloadSignal',
];
