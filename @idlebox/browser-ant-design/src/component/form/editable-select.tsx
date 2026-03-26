import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Select, Typography, type SelectProps } from 'antd';
import { AbstractEditableInput, type IEdiableInputProps, type IEditableInputProps } from './editable-input.js';

type IEditableSelectProps = Omit<IEdiableInputProps<string> & SelectProps, 'renderText' | 'renderInput'>;

export function EditableSelect({
	className,
	style,
	editing,
	defaultValue,
	id,
	value,
	onChange,
	onCancel,
	onSubmit,
	onEditing,
	...props
}: IEditableSelectProps) {
	const renderText = ({ value }: { value: string }) => {
		const option = props.options?.find((opt) => opt.value === value);
		return <Typography.Text>{option ? option.label : '?'}</Typography.Text>;
	};

	function renderInput({ finishEditing, submit, onChange, value }: IEditableInputProps<any>) {
		return (
			<>
				<Select style={{ flex: 1 }} {...props} value={value} onChange={onChange} />
				<Button onClick={submit} icon={<CheckOutlined />} variant="text" />
				<Button onClick={finishEditing} icon={<CloseOutlined />} variant="text" />
			</>
		);
	}

	return (
		<AbstractEditableInput
			className={className}
			style={style}
			editing={editing}
			defaultValue={defaultValue}
			id={id}
			value={value}
			onChange={onChange}
			onCancel={onCancel}
			onSubmit={onSubmit}
			onEditing={onEditing}
			renderText={renderText}
			renderInput={renderInput}
		/>
	);
}

export function createOptions(optionMap: Record<string | number, string>): SelectProps['options'] {
	return Object.entries(optionMap).map(([value, label]) => {
		return { value, label };
	});
}
