/**
 * 本文件定义了一个增强版的 Form 组件（可以原地替代）
 * 集成了数据加载、提交和状态管理功能，并通过 Context 暴露一些功能
 */
import { useAsync, useDisabledValue, useLatestCallback } from '@idlebox/browser-react';
import { Form, type FormInstance, type FormProps } from 'antd';
import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';

/**
 * 此名称表示创建新条目，作为路由参数使用，相当于ObjectId的“空”值
 */
export const CREATE_TOKEN = 'create';

interface IFormItemProps {
	readonly disabled?: boolean;
}
/**
 * 用于自定义form input
 *
 * 获取当前input应该处于什么状态
 */
export function useEnhancedFormItem(props: IFormItemProps) {
	const form = useEnhancedForm(false);
	const disabled = useDisabledValue(props.disabled || form?.disabled);
	return {
		disabled,
	} as const;
}

const formContext = createContext<IEnhancedForm<any>>(undefined as any);

interface MyControl {
	readonly id: string;
	readonly isCreating: boolean;
	readonly disabled: boolean;
	_refresh(): Promise<void>;

	/** @deprecated 用 _refresh */
	resetFields(): void;
}

export type IEnhancedForm<T> = FormInstance<T> & MyControl;

export function useEnhancedForm<T>(): IEnhancedForm<T>;
/** @internal */
export function useEnhancedForm<T>(r: false): IEnhancedForm<T> | null;
export function useEnhancedForm<T>(require: boolean = true): IEnhancedForm<T> | null {
	const form = useContext(formContext);
	if (require) {
		if (!form) {
			throw new Error('渲染树向上没有找到 <EnhancedForm />');
		}
	}
	return form;
}

export interface IEnhancedFormProps<T>
	extends PropsWithChildren,
		Omit<FormProps, 'children' | 'initialValues' | 'form' | 'id' | 'form'> {
	readonly id: string;
	load(id: string): Promise<T>;
	defaults(): T;
	submit(data: T, form: IEnhancedForm<T>): Promise<void>;
	readonly submitNotifyTitle?: string;
}

function isComplexObject(value: any): boolean {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}
	if (Object.keys(value).length === 0) {
		return false;
	}
	return true;
}

function makeApplyObject(form: FormInstance, values: any) {
	const updates: { name: any; value: any; touched: boolean }[] = [];
	function apply(key: string[], value: any) {
		if (isComplexObject(value)) {
			for (const sub_key of Object.keys(value)) {
				apply([...key, sub_key], value[sub_key]);
			}
		} else {
			updates.push({ name: key, value: value, touched: false });
		}
	}
	for (const key of Object.keys(form.getFieldsValue())) {
		apply([key], values[key]);
	}
	return updates;
}

export function EnhancedForm<T = Record<string, any>>({
	submitNotifyTitle = '保存',
	children,
	id: _id,
	load,
	submit,
	disabled: selfDisabled,
	defaults,
	...formProps
}: IEnhancedFormProps<T>) {
	const defer = useAsync(submitNotifyTitle, selfDisabled);
	const [form] = Form.useForm();
	const id = _id && _id !== CREATE_TOKEN ? _id : '';

	const refresh = useLatestCallback(async function refresh() {
		const content: any = defaults();
		if (id) {
			const data = await load(id);
			Object.assign(content, data);
		}
		const update = makeApplyObject(form, content);
		console.log('表单刷新：', update);

		form.setFields(update);
	});

	useEffect(() => {
		defer.executeSilent('获取信息', refresh);
	}, [id]);

	function handle_submit(fields: T) {
		defer.execute('提交', async () => {
			await submit(fields, eform);
		});
	}

	const eform = useMemo(
		function mergeFormApi() {
			const myControl: MyControl = {
				get id() {
					return id;
				},
				get disabled() {
					return defer.disabled;
				},
				get isCreating() {
					return id === '';
				},
				_refresh: refresh,
				resetFields: () => {
					throw new Error('禁止使用 resetFields，请使用 _refresh');
				},
			};
			return Object.assign(form, myControl);
		},
		[id, defer.disabled, form],
	);

	return (
		<formContext.Provider value={eform}>
			<Form
				disabled={defer.disabled}
				initialValues={defaults() as any}
				{...formProps}
				form={form}
				onFinish={handle_submit}
			>
				{children}
			</Form>
		</formContext.Provider>
	);
}
