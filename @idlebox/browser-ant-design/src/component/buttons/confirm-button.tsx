import { useAsync } from '@idlebox/browser-react';
import { Popconfirm, type ButtonProps } from 'antd';
import { cloneElement, useEffect, useState } from 'react';

interface IConfirmProps {
	children: React.ReactElement<ButtonProps & { onClick?: (e?: React.MouseEvent) => Promise<any> | any }>;
	title: string;
	position?: 'left' | 'top' | 'right' | 'bottom';
	disabled?: boolean;
	description?: string;
	okText: string;
	cancelText?: string;
	passthrough?: boolean;
}
export function ConfirmButton({ children, title, position, disabled, description, okText, cancelText = '放弃', passthrough }: IConfirmProps) {
	const [open, setOpen] = useState(false);

	const defer = useAsync(title);

	useEffect(() => {
		if (disabled && open) setOpen(false);
	}, [disabled]);

	function handleConfirm(e?: React.MouseEvent) {
		return originalClick?.(e);
	}

	if (passthrough) return children;

	const originalClick = children.props.onClick;
	const child = cloneElement(children, {
		loading: defer.loading,
		disabled: defer.loading || disabled || open,
		onClick: () => {
			setOpen(!open);
		},
	});
	return (
		<Popconfirm
			cancelText={cancelText}
			description={description}
			okButtonProps={{
				danger: true,
				disabled: defer.loading || disabled,
			}}
			okText={okText}
			onConfirm={originalClick ? handleConfirm : undefined}
			onOpenChange={setOpen}
			open={open}
			placement={position}
			showCancel={!defer.loading}
			title={title}
		>
			{child}
		</Popconfirm>
	);
}
