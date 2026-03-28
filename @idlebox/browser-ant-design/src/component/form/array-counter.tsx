import { Form } from 'antd';
import { FormTextField } from './text-field.js';

interface ICounterProps {
	name: string;
	prefix?: string;
	suffix?: string;
	skipZero?: boolean;
	className?: string;
}

export function FormArrayCounter({ name, ...pass }: ICounterProps) {
	return (
		<Form.List name={name}>
			{() => {
				// console.log('fields', fields);
				return (
					<Form.Item key="conter" name="length" noStyle>
						<FormTextField {...pass} />
					</Form.Item>
				);
			}}
		</Form.List>
	);
}
