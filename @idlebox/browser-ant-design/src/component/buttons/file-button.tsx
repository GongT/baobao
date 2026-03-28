import { UploadOutlined } from '@ant-design/icons';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Button, Upload, type ButtonProps, type GetProp } from 'antd';
import type { UploadProps } from 'antd/es/upload/interface.js';
import { useState, type ReactNode } from 'react';
import type { IAntdCustomInputProps } from '../../common/custom-input.js';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const passTypes = [
	'type',
	'shape',
	'color',
	'ghost',
	'htmlType',
	'size',
	'variant',
	'icon',
	'iconPosition',
	'disabled',
	'loading',
	'className',
	'rootClassName',
	'danger',
	'block',
	'classNames',
	'styles',
] as const;
type passTypes = (typeof passTypes)[number];
interface IFileButtonProps extends IAntdCustomInputProps<FileType | null>, Pick<ButtonProps, passTypes> {
	children: ReactNode;
	accept?: UploadProps['accept'];
}

const useStyles = makeStyles({
	input: { display: 'none' },
	button: {},
});

export function FileButton({ onChange, id, className, children = '选择文件', value, icon = <UploadOutlined />, accept, ...props }: IFileButtonProps) {
	const classes = useStyles();

	function onBeforeUpload(file: FileType) {
		onChange?.(file);
		return false;
	}
	function handleRemove() {
		onChange?.(null);
	}

	return (
		<Upload beforeUpload={onBeforeUpload} disabled={props.disabled} fileList={[]} onRemove={handleRemove}>
			<Button className={mergeClasses(className, classes.button)} id={id} {...props} icon={icon}>
				{children}
			</Button>
		</Upload>
	);
}

interface IParsedFileButtonProps<T> extends Omit<IFileButtonProps, 'value' | 'onChange'> {
	parse: (data: File) => Promise<T> | T;
	value?: T | null;
	onChange?: (value: T | null) => void;
}
export function ParsedFileButton({ parse, value, onChange, ...props }: IParsedFileButtonProps<any>) {
	const [file, setFile] = useState<FileType | null>(null);

	async function handleChange(file: FileType | null) {
		setFile(file);
		if (file) {
			try {
				const result = await parse(file);
				onChange?.(result);
			} catch (e) {
				console.error(e);
				onChange?.(null);
			}
		} else {
			onChange?.(null);
		}
	}

	return <FileButton onChange={handleChange} value={file} {...props} />;
}

export function JsonFileButton<T>(props: Omit<IParsedFileButtonProps<T>, 'parse' | 'accept'>) {
	return (
		<ParsedFileButton
			parse={async (file) => {
				const text = await file.text();
				return JSON.parse(text) as T;
			}}
			{...props}
			accept="application/json,text/json"
		/>
	);
}

export function TextFileButton(props: Omit<IParsedFileButtonProps<string>, 'parse'>) {
	return (
		<ParsedFileButton
			parse={async (file) => {
				const text = await file.text();
				return text;
			}}
			{...props}
		/>
	);
}
