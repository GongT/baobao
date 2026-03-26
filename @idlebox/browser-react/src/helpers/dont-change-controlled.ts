/** biome-ignore-all lint/correctness/useHookAtTopLevel: 当受控状态发生改变时直接抛出异常 */

import { isProductionMode, noop } from '@idlebox/common';
import { useEffect, useState } from 'react';

interface IPropsWithValue<T> {
	value?: T;
	initialValue?: T;
	onChange?: (value: T) => void;
}
type IExtraProps<T> = Omit<IPropsWithValue<T>, keyof IPropsWithValue<any>>;

export function dontChangeControlled<T>(props: IPropsWithValue<T>): [T, (value: T) => void, IExtraProps<typeof props>] {
	const controlled = 'value' in props && typeof props.value !== 'undefined';

	if (!isProductionMode) {
		const [firstControlled] = useState(controlled);

		if (firstControlled !== controlled) {
			if (firstControlled) {
				throw new Error(`输入组件受控状态发生改变: ${firstControlled} -> ${controlled}`);
			} else {
				throw new Error(`输入组件受控状态发生改变: ${firstControlled} -> ${controlled}`);
			}
		}

		useEffect(() => {
			if (controlled && Object.hasOwn(props, 'initialValue')) {
				console.warn('受控组件的 initialValue 属性无效');
			}
		}, []);
	}

	const { value, onChange, initialValue, ...extra } = props;

	if (controlled) {
		return [value as T, onChange ?? noop, extra] as any;
	} else {
		const [value, setValue] = useState<T>(props.initialValue as any);

		function setValueAndCall(newValue: T) {
			setValue(newValue);
			onChange?.(newValue);
		}

		return [value, setValueAndCall, extra] as any;
	}
}
