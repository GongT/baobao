import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Select, Typography, type SelectProps } from 'antd';
import { AbstractEditableInput, type IEdiableInputProps, type IEditableInputProps } from './editable-input.js';

type IEditableSelectProps = Omit<IEdiableInputProps<string> & SelectProps, 'renderText' | 'renderInput'>;

export function EditableSelect({ className, style, editing, defaultValue, id, value, onChange, onCancel, onSubmit, onEditing, ...props }: IEditableSelectProps) {
	const renderText = ({ value }: { value: string }) => {
		const option = props.options?.find((opt) => opt.value === value);
		return <Typography.Text>{option ? option.label : '?'}</Typography.Text>;
	};

	function renderInput({ finishEditing, submit, onChange, value }: IEditableInputProps<any>) {
		return (
			<>
				<Select style={{ flex: 1 }} {...props} onChange={onChange} value={value} />
				<Button icon={<CheckOutlined />} onClick={submit} variant="text" />
				<Button icon={<CloseOutlined />} onClick={finishEditing} variant="text" />
			</>
		);
	}

	return (
		<AbstractEditableInput
			className={className}
			defaultValue={defaultValue}
			editing={editing}
			id={id}
			onCancel={onCancel}
			onChange={onChange}
			onEditing={onEditing}
			onSubmit={onSubmit}
			renderInput={renderInput}
			renderText={renderText}
			style={style}
			value={value}
		/>
	);
}

export function createOptions(optionMap: Record<string | number, string>): SelectProps['options'] {
	return Object.entries(optionMap).map(([value, label]) => {
		return { value, label };
	});
}
