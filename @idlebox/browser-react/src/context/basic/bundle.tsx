/** biome-ignore-all lint/correctness/useHookAtTopLevel: 1 */
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { ObservableMap } from './observable.map.js';
import { useDisposableEffect } from '../../hook/use-dispose.js';

const parentStateToken = Symbol('parent-state');
const basicContext = createContext({
	disableMap: new ObservableMap<boolean>(),
	loadingMap: new ObservableMap<boolean>(),
	errorMap: new ObservableMap<Error>(),
});

export enum StateInheritMode {
	/** 直通（仿佛没有这个Provider） */
	None,
	/** 继承上级状态，默认，上级状态影响下级 */
	Slave,
	/** 忽略上级状态，完全独立互不影响 */
	Private,
}

/**
 * 注意：所有模式都必须为常量
 */
interface IBasicBundle extends PropsWithChildren {
	readonly error?: StateInheritMode;
	readonly loading?: StateInheritMode;
	readonly disabled?: StateInheritMode;
}

/**
 * 包含禁用、加载和错误状态
 */
export function BasicStateProvider({
	children,
	error = StateInheritMode.Slave,
	loading = StateInheritMode.Slave,
	disabled = StateInheritMode.Slave,
}: IBasicBundle) {
	const value = {} as React.ContextType<typeof basicContext>;

	const inherit = error || loading || disabled;
	if (!inherit) {
		throw new Error('至少指定一种非直通的状态继承模式');
	}

	const parent = useContext(basicContext);
	value.disableMap = mergeStateMap(parent.disableMap, disabled);
	value.loadingMap = mergeStateMap(parent.loadingMap, loading);
	value.errorMap = mergeStateMap(parent.errorMap, error);

	return <basicContext.Provider value={value}>{children}</basicContext.Provider>;
}

/** @internal */
export function useBasicBundle() {
	return useContext(basicContext);
}

function mergeStateMap<T>(parent: ObservableMap<T>, mode: StateInheritMode): ObservableMap<T> {
	if (mode === StateInheritMode.None) {
		return parent;
	} else if (mode === StateInheritMode.Slave) {
		const scoped = useMemo(() => new ObservableMap<T>(), []);

		useDisposableEffect(function listenParentMapAnyChange() {
			return parent.onAnyChange(() => {
				const parentState = parent.getFirst();
				if (parentState) {
					scoped.set(parentStateToken, parentState);
				} else {
					scoped.delete(parentStateToken);
				}
			});
		});

		return scoped;
	} else if (mode === StateInheritMode.Private) {
		return useMemo(() => new ObservableMap<T>(), []);
	} else {
		throw new Error(`未知的状态继承模式: ${mode}`);
	}
}
// function mergeState(
