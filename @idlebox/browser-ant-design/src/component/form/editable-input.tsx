import { EditOutlined } from '@ant-design/icons';
import { makeStyles } from '@griffel/react';
import { dontChangeControlled } from '@idlebox/browser-react';
import { Typography } from 'antd';
import { useEffect } from 'react';
import type { IAntdCustomInputProps } from '../../common/custom-input.js';

export interface IEditableInputProps<T> {
	readonly value: T;
	onChange(value: T): void;

	submit(): void;
	finishEditing(): void;
}

export interface INonEditableInputProps<T> {
	readonly value: T;
}

export interface IEdiableInputProps<T> extends IAntdCustomInputProps<T> {
	readonly className?: string;
	readonly style?: React.CSSProperties;
	readonly editing?: boolean;

	readonly defaultValue?: T;

	onCancel?(): void;
	onSubmit?(newValue: T): void;
	onEditing?(editing: boolean): void;

	renderInput(props: IEditableInputProps<T>): React.ReactNode;
	renderText?(props: INonEditableInputProps<T>): React.ReactNode;
}

const useStyles = makeStyles({
	container: {
		display: 'flex',
		justifyContent: 'space-between',
		cursor: 'pointer',
	},
	editIcon: {
		cursor: 'pointer',
	},
});

export function AbstractEditableInput<T>({ id, className, style, ...props }: IEdiableInputProps<T>) {
	const defaultValue = props.defaultValue ?? props.value;
	if (defaultValue === undefined) throw new Error('defaultValue or value is required');
	const [managedValue, setValue] = dontChangeControlled(props);
	const [editing, setEditing] = dontChangeControlled<boolean>({
		value: props.editing,
		onChange: props.onEditing,
	});
	const classes = useStyles();

	if (!className) {
		className = classes.container;
	} else {
		className += ` ${classes.container}`;
	}
	if (editing) className += ' editing';

	useEffect(() => {
		if (Object.hasOwn(props, 'defaultValue')) {
			setValue(props.defaultValue as unknown as T);
		}
	}, [props.defaultValue]);

	function startEditing() {
		setEditing(true);
		props.onEditing?.(true);
	}

	function finishEditing() {
		setEditing(false);
		props.onEditing?.(false);
	}

	function commit() {
		props.onSubmit?.(managedValue);
		finishEditing();
	}

	function cancel() {
		const defaultValue = props.defaultValue ?? props.value;
		if (defaultValue === undefined) throw new Error('defaultValue or value is required for canceling');
		setValue(defaultValue);
		props.onCancel?.();
		finishEditing();
	}

	if (editing) {
		const child = props.renderInput({
			finishEditing: cancel,
			submit: commit,
			value: managedValue,
			onChange: setValue,
		});

		return (
			<div className={className} id={id} style={style}>
				{child}
			</div>
		);
	} else {
		return (
			<div className={className} id={id} onClick={startEditing} style={style}>
				{props.renderText ? props.renderText({ value: managedValue }) : defaultRenderInput({ value: managedValue })}
				<EditOutlined />
			</div>
		);
	}
}

function defaultRenderInput<T>(props: INonEditableInputProps<T>) {
	return <Typography.Text>{props.value as any}</Typography.Text>;
}
