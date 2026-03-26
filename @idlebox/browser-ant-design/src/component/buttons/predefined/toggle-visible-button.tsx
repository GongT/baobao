import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { ToggleButton, type IToggleButtonProps } from '../toggle-button.js';

type IToggleVisibleButtonProps = Omit<IToggleButtonProps, 'icon' | 'children' | 'title'>;

type IToggleVisibleButtonQuickProps = Omit<IToggleVisibleButtonProps, 'id'> & {
	onVisible(id: string, visible: boolean): void;
	readonly id: string;
};

export function ToggleVisibleButton({
	onChange,
	...props
}: IToggleVisibleButtonQuickProps | IToggleVisibleButtonProps) {
	const p = props as IToggleVisibleButtonQuickProps;
	if (typeof p.onVisible === 'function') {
		const onVis = p.onVisible;
		delete (p as any).onVisible;

		const old = onChange;
		onChange = (visible) => {
			onVis(p.id, visible);
			old?.(visible);
		};
	}

	return (
		<ToggleButton
			variant="outlined"
			color="default"
			type="default"
			{...props}
			// biome-ignore lint/correctness/useJsxKeyInIterable: 这不是数组
			icon={[<EyeInvisibleOutlined />, <EyeOutlined />]}
			title={['隐藏', '显示']}
			onChange={onChange}
		/>
	);
}
