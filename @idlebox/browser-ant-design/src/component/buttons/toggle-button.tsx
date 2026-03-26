import { dontChangeControlled } from '@idlebox/browser-react';
import { Button, type ButtonProps } from 'antd';
import type { ReactNode } from 'react';

export interface IToggleButtonProps extends Omit<ButtonProps, 'onClick' | 'onChange' | 'value' | 'icon' | 'children' | 'title'> {
	readonly value?: boolean;
	onChange?: (value: boolean) => void;

	// 显示, 隐藏
	icon?: [ReactNode, ReactNode];
	title?: [string, string];
	text?: [ReactNode, ReactNode];
}

export function ToggleButton({ icon, text, title, ...props }: IToggleButtonProps) {
	const [value, setValue, extra] = dontChangeControlled(props);

	const vicon = icon?.[value ? 0 : 1];
	const vtext = text?.[value ? 0 : 1];
	const vtitle = title?.[value ? 0 : 1];

	return (
		<Button {...extra} icon={vicon} title={vtitle} onClick={() => setValue(!value)}>
			{vtext ?? vtitle}
		</Button>
	);
}
