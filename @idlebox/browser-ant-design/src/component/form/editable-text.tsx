import { CheckOutlined, EditOutlined } from '@ant-design/icons';
import { dontChangeControlled } from '@idlebox/browser-react';
import { makeStyles } from '@griffel/react';
import { Input, Typography, type InputRef } from 'antd';
import type { KeyboardEvent } from 'react';
import type { IAntdCustomInputProps } from '../../common/custom-input.js';

interface IProps extends IAntdCustomInputProps<string> {
	className?: string;
	style?: React.CSSProperties;
	suffix?: React.ReactNode;
	placeholder?: string;
	editing?: boolean;
	onCancel?(): void;
	onSubmit?(newValue: string): void;
	onEditing?(editing: boolean): void;
	inputRef?: React.RefObject<InputRef | null>;
	initialValue?: string;
}

const useStyles = makeStyles({
	container: {
		display: 'inline-flex',
		justifyContent: 'space-between',
		cursor: 'pointer',
	},
	editIcon: {
		cursor: 'pointer',
	},
});

/**
 * @deprecated Use EditableInput instead
 */
export function EditableText({ inputRef, id, suffix, placeholder, className, style, ...props }: IProps) {
	const [text, setText] = dontChangeControlled(props);
	const [editing, setEditing] = dontChangeControlled<boolean>({
		value: props.editing,
		onChange: props.onEditing,
	});
	const classes = useStyles();

	function startEditing() {
		// console.log('startEditing');
		setEditing(true);
	}

	function commit() {
		// console.log('commit');
		setEditing(false);
		props.onSubmit?.(text);
	}

	function cancel() {
		// console.log('cancel');
		setEditing(false);
		props.onCancel?.();
	}

	function handleKeyUp(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			commit();
		} else if (event.key === 'Escape') {
			cancel();
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setText(e.target.value);
	}

	if (!className) {
		className = classes.container;
	} else {
		className = `${className} ${classes.container}`;
	}

	if (editing) {
		return (
			<div className={className} id={id} style={style}>
				<Input
					autoFocus
					onChange={handleChange}
					onKeyUp={handleKeyUp}
					placeholder={placeholder}
					ref={inputRef}
					suffix={
						<>
							{suffix}
							<CheckOutlined className={classes.editIcon} onClick={commit} />
						</>
					}
					value={text}
				/>
			</div>
		);
	} else {
		return (
			<div className={className} id={id} onClick={startEditing} style={style}>
				<Typography.Text>{text}</Typography.Text>
				<EditOutlined />
			</div>
		);
	}
}
