import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

export function renderVisibleTag(visible: boolean) {
	if (visible) {
		return (
			<Tag color="success" icon={<EyeOutlined />}>
				是
			</Tag>
		);
	} else {
		return (
			<Tag color="warning" icon={<EyeInvisibleOutlined />}>
				否
			</Tag>
		);
	}
}
