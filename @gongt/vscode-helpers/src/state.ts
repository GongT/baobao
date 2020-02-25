export enum ExtensionState {
	BEFORE_INIT = 0,
	INIT = 1,
	NORMAL = 2,
	DEINIT = 3,
	EXIT = 4,
}
export let extensionState: ExtensionState = ExtensionState.BEFORE_INIT;

/** @internal */
export function _setExtStat(stat: ExtensionState) {
	extensionState = stat;
}
