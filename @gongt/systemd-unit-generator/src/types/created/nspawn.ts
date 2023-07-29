
// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface INspawnExecSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Boot= */
	Boot?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Ephemeral= */
	Ephemeral?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#ProcessTwo= */
	ProcessTwo?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Parameters= */
	Parameters?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Environment= */
	Environment?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#User= */
	User?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#WorkingDirectory= */
	WorkingDirectory?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#PivotRoot= */
	PivotRoot?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Capability= */
	Capability?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Capability= */
	DropCapability?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#AmbientCapability= */
	AmbientCapability?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#NoNewPrivileges= */
	NoNewPrivileges?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#KillSignal= */
	KillSignal?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Personality= */
	Personality?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#MachineID= */
	MachineID?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#PrivateUsers= */
	PrivateUsers?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#NotifyReady= */
	NotifyReady?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#SystemCallFilter= */
	SystemCallFilter?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitCPU?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitFSIZE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitDATA?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitSTACK?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitCORE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitRSS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitNOFILE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitAS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitNPROC?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitMEMLOCK?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitLOCKS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitSIGPENDING?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitMSGQUEUE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitCPU= */
	LimitNICE?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitRTPRIO= */
	LimitRTPRIO?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LimitRTPRIO= */
	LimitRTTIME?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#OOMScoreAdjust= */
	OOMScoreAdjust?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#CPUAffinity= */
	CPUAffinity?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Hostname= */
	Hostname?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#ResolvConf= */
	ResolvConf?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Timezone= */
	Timezone?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#LinkJournal= */
	LinkJournal?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#SuppressSync= */
	SuppressSync?: MaybeArray<string>;
}

export const nspawnExecFields: readonly string[] = ["Boot","Ephemeral","ProcessTwo","Parameters","Environment","User","WorkingDirectory","PivotRoot","Capability","DropCapability","AmbientCapability","NoNewPrivileges","KillSignal","Personality","MachineID","PrivateUsers","NotifyReady","SystemCallFilter","LimitCPU","LimitFSIZE","LimitDATA","LimitSTACK","LimitCORE","LimitRSS","LimitNOFILE","LimitAS","LimitNPROC","LimitMEMLOCK","LimitLOCKS","LimitSIGPENDING","LimitMSGQUEUE","LimitNICE","LimitRTPRIO","LimitRTTIME","OOMScoreAdjust","CPUAffinity","Hostname","ResolvConf","Timezone","LinkJournal","SuppressSync"];

export interface INspawnFilesSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#ReadOnly= */
	ReadOnly?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Volatile= */
	Volatile?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Bind= */
	Bind?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Bind= */
	BindReadOnly?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#BindUser= */
	BindUser?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#TemporaryFileSystem= */
	TemporaryFileSystem?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Inaccessible= */
	Inaccessible?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Overlay= */
	Overlay?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Overlay= */
	OverlayReadOnly?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#PrivateUsersOwnership= */
	PrivateUsersOwnership?: MaybeArray<string>;
}

export const nspawnFilesFields: readonly string[] = ["ReadOnly","Volatile","Bind","BindReadOnly","BindUser","TemporaryFileSystem","Inaccessible","Overlay","OverlayReadOnly","PrivateUsersOwnership"];

export interface INspawnNetworkSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Private= */
	Private?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#VirtualEthernet= */
	VirtualEthernet?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#VirtualEthernetExtra= */
	VirtualEthernetExtra?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Interface= */
	Interface?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#MACVLAN= */
	MACVLAN?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#MACVLAN= */
	IPVLAN?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Bridge= */
	Bridge?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Zone= */
	Zone?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.nspawn.html#Port= */
	Port?: MaybeArray<string>;
}

export const nspawnNetworkFields: readonly string[] = ["Private","VirtualEthernet","VirtualEthernetExtra","Interface","MACVLAN","IPVLAN","Bridge","Zone","Port"];

export type __INspawnAll = INspawnExecSection & INspawnFilesSection & INspawnNetworkSection;
