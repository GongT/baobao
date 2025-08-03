import type { ISystemdAutomountUnit, ISystemdMountUnit, ISystemdPathUnit, ISystemdScopeUnit, ISystemdServiceUnit, ISystemdSocketUnit, ISystemdSwapUnit, ISystemdTimerUnit, ISystemdUnit } from '../types/index.js';

export function isInstallableUnit(u: ISystemdUnit): u is ISystemdUnit & Required<Pick<ISystemdUnit, 'Install'>> {
	return !!u.Install;
}
export function isServiceUnit(u: ISystemdUnit): u is ISystemdServiceUnit {
	return !!u.Service;
}
export function isSocketUnit(u: ISystemdUnit): u is ISystemdSocketUnit {
	return !!u.Socket;
}
export function isMountUnit(u: ISystemdUnit): u is ISystemdMountUnit {
	return !!u.Mount;
}
export function isAutomountUnit(u: ISystemdUnit): u is ISystemdAutomountUnit {
	return !!u.Automount;
}
export function isSwapUnit(u: ISystemdUnit): u is ISystemdSwapUnit {
	return !!u.Swap;
}
export function isPathUnit(u: ISystemdUnit): u is ISystemdPathUnit {
	return !!u.Path;
}
export function isTimerUnit(u: ISystemdUnit): u is ISystemdTimerUnit {
	return !!u.Timer;
}
export function isScopeUnit(u: ISystemdUnit): u is ISystemdScopeUnit {
	return !!u.Scope;
}
