import { useEffect, useState } from 'react';
import { EditableText } from './editable-text.js';

interface IEditFieldProps {
	readonly id: string;
	readonly value: string;
	onChange?(value: string): void;
	onSubmit?(id: string, value: string): void;
	readonly style?: React.CSSProperties;
}
export function EditableField(props: IEditFieldProps) {
	const [value, setValue] = useState(props.value);

	useEffect(() => {
		setValue(props.value);
	}, [props.value]);

	function commit() {
		props.onChange?.(value);
		props.onSubmit?.(props.id, value);
	}
	return (
		<EditableText
			style={{ display: 'flex', ...(props.style || {}) }}
			value={value}
			onChange={setValue}
			onSubmit={commit}
		/>
	);
}
