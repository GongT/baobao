import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import type React from 'react';

export function renderBinaryTag(
	yes: string,
	no: string,
	yesIcon: React.ReactNode = <CheckOutlined />,
	noIcon: React.ReactNode = <CloseOutlined />,
) {
	return (confirm: any) => <BinaryTag confirm={confirm} no={no} yes={yes} yesIcon={yesIcon} noIcon={noIcon} />;
}

interface Props {
	yes?: string;
	no?: string;
	yesIcon?: React.ReactNode;
	noIcon?: React.ReactNode;
	confirm: any;
}
export function BinaryTag({
	yes = '是',
	no = '否',
	yesIcon = <CheckOutlined />,
	noIcon = <CloseOutlined />,
	confirm,
}: Props) {
	if (confirm) {
		return (
			<Tag icon={yesIcon} color="success">
				{yes}
			</Tag>
		);
	} else {
		return (
			<Tag icon={noIcon} color="warning">
				{no}
			</Tag>
		);
	}
}

export const renderYesNoTag = renderBinaryTag('是', '否');
