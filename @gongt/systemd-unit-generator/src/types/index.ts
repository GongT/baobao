import type {
	IAutomountSection,
	IKillSection,
	IMountSection,
	IPathSection,
	IResourceControlSection,
	IScopeSection,
	IServiceSection,
	ISocketSection,
	ISwapSection,
	ITimerSection,
	IUnitInstallSection,
	IUnitUnitSection,
	__IExecAll,
} from './all.js';

export type * from './all.js';

export interface ISystemdUnit {
	Unit: IUnitUnitSection & UnknownFields;
	Install?: IUnitInstallSection & UnknownFields;
	Service?: IServiceSection & __IExecAll & IKillSection & IResourceControlSection & UnknownFields;
	Socket?: ISocketSection & __IExecAll & IKillSection & UnknownFields;
	Mount?: IMountSection & __IExecAll & IKillSection & UnknownFields;
	Automount?: IAutomountSection & UnknownFields;
	Swap?: ISwapSection & __IExecAll & IKillSection & UnknownFields;
	Path?: IPathSection & UnknownFields;
	Timer?: ITimerSection & UnknownFields;
	Scope?: IScopeSection & UnknownFields;
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
