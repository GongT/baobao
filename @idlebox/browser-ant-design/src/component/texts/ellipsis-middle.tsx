import { Typography } from 'antd';

interface IProps {
	suffix: number;
	children: string;
}

/**
 * 文本过长时省略中间
 */
export const EllipsisMiddle: React.FC<IProps> = ({ suffix, children }) => {
	const start = children.slice(0, children.length - suffix);
	const suffixText = children.slice(-suffix).trim();
	return (
		<Typography.Text ellipsis={{ suffix: suffixText }} style={{ maxWidth: '100%' }}>
			{start}
		</Typography.Text>
	);
};
