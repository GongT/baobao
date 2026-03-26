import { Typography } from 'antd';

export function HashString(props: { children: string | string[]; length?: number; style?: React.CSSProperties }) {
	const length = props.length ?? 8;
	const left = Math.ceil(length / 2);
	const right = Math.floor(length / 2);
	const v = (props.children as string[]).join?.('') ?? props.children;

	const style = props.style ?? {};
	style.userSelect = 'all';
	style.fontFamily = 'monospace';
	style.whiteSpace = 'nowrap';

	return (
		<Typography.Text title={v} style={style}>
			{v.slice(0, left)}
			<span style={{ userSelect: 'none', margin: '0 0.2em' }}>...</span>
			<span style={{ overflow: 'hidden', height: 1, width: 1, display: 'inline-block' }}>{v.slice(left, -right)}</span>
			{v.slice(-right)}
		</Typography.Text>
	);
}

export function renderObjectId(v: string) {
	return (
		<Typography.Text title={v} style={{ whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
			<span style={{ userSelect: 'none', fontWeight: 'bold' }}>$</span>
			<HashString style={{ fontStyle: 'italic' }}>{v}</HashString>
		</Typography.Text>
	);
}

export function ObjectIdString(props: { id: string }) {
	return renderObjectId(props.id);
}
