export interface IAntdCustomInputProps<T> {
	id?: string;
	value?: T;
	onChange?: (newValue: T) => void;
}
