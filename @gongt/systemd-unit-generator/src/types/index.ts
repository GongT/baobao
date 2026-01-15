import type {
	IAutomountOptions,
	IExecFields,
	IKillOptions,
	IMountOptions,
	IPathOptions,
	IResourceControlOptions,
	IScopeOptions,
	IServiceOptions,
	ISocketOptions,
	ISwapOptions,
	ITimerOptions,
	IUnitInstallOptions,
	IUnitOptions,
} from './everything.generated.js';

export type * from './everything.generated.js';
export { DocumentVersion } from './everything.generated.js';

export interface ISystemdUnit {
	Unit: IUnitOptions & UnknownFields;
	Install?: IUnitInstallOptions & UnknownFields;
	Service?: IServiceOptions & IExecFields & IKillOptions & IResourceControlOptions & UnknownFields;
	Socket?: ISocketOptions & IExecFields & IKillOptions & UnknownFields;
	Mount?: IMountOptions & IExecFields & IKillOptions & UnknownFields;
	Automount?: IAutomountOptions & UnknownFields;
	Swap?: ISwapOptions & IExecFields & IKillOptions & UnknownFields;
	Path?: IPathOptions & UnknownFields;
	Timer?: ITimerOptions & UnknownFields;
	Scope?: IScopeOptions & UnknownFields;
}

export interface IUnknownSection {
	[id: string]: UnknownFields;
}

export type UnknownFields = Record<string, string | string[]>;

export type ISystemdServiceUnit = Required<Pick<ISystemdUnit, 'Unit' | 'Install' | 'Service'>> & IUnknownSection;
export type ISystemdSocketUnit = Required<Pick<ISystemdUnit, 'Unit' | 'Install' | 'Socket'>> & IUnknownSection;
export type ISystemdMountUnit = Required<Pick<ISystemdUnit, 'Unit' | 'Install' | 'Mount'>> & IUnknownSection;
export type ISystemdAutomountUnit = Required<Pick<ISystemdUnit, 'Unit' | 'Install' | 'Automount'>> & IUnknownSection;
export type ISystemdSwapUnit = Required<Pick<ISystemdUnit, 'Unit' | 'Install' | 'Swap'>> & IUnknownSection;
export type ISystemdTargetUnit = Required<Pick<ISystemdUnit, 'Unit' | 'Install' | 'Install'>> & IUnknownSection;
export type ISystemdPathUnit = Required<Pick<ISystemdUnit, 'Unit' | 'Install' | 'Path'>> & IUnknownSection;
export type ISystemdTimerUnit = Required<Pick<ISystemdUnit, 'Unit' | 'Install' | 'Timer'>> & IUnknownSection;
export type ISystemdSliceUnit = Required<Pick<ISystemdUnit, 'Unit' | 'Install'>> & IUnknownSection;
export type ISystemdScopeUnit = Required<Pick<ISystemdUnit, 'Unit' | 'Install' | 'Scope'>> & IUnknownSection;
