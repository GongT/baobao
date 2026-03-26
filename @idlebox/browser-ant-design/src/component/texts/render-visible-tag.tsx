import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

export function renderVisibleTag(visible: boolean) {
	if (visible) {
		return (
			<Tag icon={<EyeOutlined />} color="success">
				是
			</Tag>
		);
	} else {
		return (
			<Tag icon={<EyeInvisibleOutlined />} color="warning">
				否
			</Tag>
		);
	}
}
