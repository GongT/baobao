import { CloseOutlined, RollbackOutlined } from '@ant-design/icons';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Button, Flex, Progress } from 'antd';
import type React from 'react';
import { forwardRef } from 'react';
import { DropControlState, HoverState, Reset, uploaderProps, UploadStage, type IUploaderUiProps } from './context.js';

interface IAdditionalProps {
	readonly className?: string;
}

export const FileDropZoneBlock = forwardRef<HTMLDivElement, IAdditionalProps>((props: IAdditionalProps, ref) => {
	const classes = useStyles();
	const { aborter, hover, percent, state, error, type, stage, disabled, currentFile, totalFiles, ...additionalProps } = props as IUploaderUiProps;

	const { what, icon } = uploaderProps[type];

	function handleCancelUpload() {
		aborter.abort(new Error('用户主动取消上传'));
	}
	function handleDelete() {
		aborter.abort(new Reset());
	}

	let styleState: keyof typeof classes = state;
	let body: React.ReactNode;
	if (state === DropControlState.Idle) {
		switch (hover) {
			case HoverState.None:
				body = (
					<>
						<div className={classes.icon}>{icon}</div>
						<div className={classes.first}>点击上传{what}</div>
						<div className={classes.second}>或拖动{what}文件到这里</div>
					</>
				);
				break;
			case HoverState.WillAccept:
				styleState = HoverState.WillAccept;
				body = (
					<>
						<div className={classes.icon}>{icon}</div>
						<div className={classes.first}>点击上传{what}</div>
						<div className={classes.second}>松开鼠标上传文件</div>
					</>
				);
				break;
			case HoverState.WillReject:
				styleState = DropControlState.Error;
				body = (
					<>
						<div className={classes.icon}>{<CloseOutlined />}</div>
						<div className={classes.first}>错误文件</div>
						<div className={classes.second}>只能上传{what}类型的文件</div>
					</>
				);
				break;
		}
		if (disabled) {
			styleState = 'disabled';
		}
	} else if (state === DropControlState.Uploading) {
		let message: string;
		switch (stage) {
			case UploadStage.Finished:
				message = `已完成`;
				break;
			case UploadStage.Hashing:
				message = `计算哈希`;
				break;
			case UploadStage.Preparing:
				message = `准备中`;
				break;
			default:
				message = `正在上传${what}`;
		}
		body = (
			<>
				<div className={classes.icon}>
					<Progress percent={percent} size="small" type="circle" />
				</div>
				<div className={classes.first}>{message}</div>
				<div className={classes.action}>
					<Button danger icon={<CloseOutlined />} onClick={handleCancelUpload}>
						取消上传
					</Button>
				</div>
			</>
		);
	} else if (state === DropControlState.PostProcessing) {
		body = (
			<>
				<div className={classes.icon}>
					<Progress size="small" type="circle" />
				</div>
				<div className={classes.first}>处理中，请稍候</div>
			</>
		);
	} else if (state === DropControlState.Success) {
		body = (
			<>
				<div className={classes.icon}>
					<Progress percent={percent} size="small" type="circle" />
				</div>
				<div className={classes.first}>{what}上传成功</div>
				<div className={classes.action}>
					<Button color="orange" icon={<RollbackOutlined />} onClick={handleDelete} variant="outlined">
						放弃
					</Button>
				</div>
			</>
		);
	} else {
		body = (
			<>
				<div className={classes.icon}>
					<Progress percent={percent} size="small" status="exception" type="circle" />
				</div>
				<div className={classes.first}>{what}上传失败</div>
				<div className={classes.second}>{error?.message}</div>
			</>
		);
	}

	const ex: string[] = [];
	if (props.className) ex.push(props.className);

	const className = mergeClasses(classes.container, classes[styleState], ...ex);

	return (
		<Flex align="center" className={className} justify="center" vertical {...additionalProps} ref={ref}>
			{body}
		</Flex>
	);
});

const useStyles = makeStyles({
	container: {
		width: '220px',
		height: '200px',
		// boxSizing: 'content-box',
		transition: 'backgroundColor 0.3s, borderColor 0.3s, color 0.3s, transform 0.2s',
		border: 'transparent 2px solid',
		backgroundColor: 'var(--ant-color-bg-container)',
		whiteSpace: 'nowrap',
	},
	[DropControlState.Idle]: {
		cursor: 'pointer',
		color: 'var(--ant-color-primary)',
		':hover': {
			backgroundColor: 'var(--ant-color-fill-secondary)',
			border: 'var(--ant-color-primary) 2px dashed',
		},
	},
	activate: {
		backgroundColor: 'var(--ant-color-fill-secondary)',
		border: 'var(--ant-color-primary) 2px dashed',
	},
	[DropControlState.Uploading]: {
		cursor: 'default',
		color: 'var(--ant-color-text)',
		backgroundImage: `linear-gradient(90deg, var(--ant-color-primary) 50%, transparent 50%),
			linear-gradient(0deg, var(--ant-color-primary) 50%, transparent 50%),
			linear-gradient(90deg, var(--ant-color-primary) 50%, transparent 50%),
			linear-gradient(0deg, var(--ant-color-primary) 50%, transparent 50%)`,
		backgroundColor: `var(--ant-color-bg-container)`,
		backgroundSize: `10px 2px, 2px 10px, 10px 2px, 2px 10px`,
		backgroundPosition: `0% 0%, 100% 0%, 0% 100%, 0% 0%`,
		backgroundRepeat: `repeat-x, repeat-y, repeat-x, repeat-y`,

		animationDuration: '4s',
		animationIterationCount: 'infinite',
		animationTimingFunction: 'linear',
		animationName: {
			from: { backgroundPosition: '0% 0%, 100% 0%, 0% 100%, 0% 0%' },
			to: { backgroundPosition: '100% 0%, 100% 100%, -100% 100%, 0% -100%' },
		},
	},
	[HoverState.WillAccept]: {
		cursor: 'default',
		color: 'var(--ant-color-success)',
		border: 'var(--ant-color-success) 2px solid',
		transform: 'translateY(-4px)',
	},
	[DropControlState.Success]: {
		cursor: 'default',
		color: 'var(--ant-color-primary)',
		border: 'var(--ant-color-success) 2px solid',
	},
	[DropControlState.Error]: {
		cursor: 'pointer',
		color: 'var(--ant-color-error)',
		border: 'var(--ant-color-error) 2px dashed',
	},
	[DropControlState.PostProcessing]: {
		cursor: 'progress',
		color: 'var(--ant-color-primary)',
		border: 'var(--ant-color-success) 2px solid',
	},
	disabled: {
		cursor: 'not-allowed',
		color: 'var(--ant-color-text-disabled)',
		background: 'var(--ant-color-bg-blur)',
		border: 'var(--ant-color-bg-container) 2px solid',
	},
	icon: {
		fontSize: '48px',
		height: '86px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
	},
	first: {
		fontSize: 'var(--ant-font-size-xl)',
		margin: '8px 0 10px 0',
	},
	second: {
		fontSize: 'var(--ant-font-size)',
		lineHeight: 'var(--ant-control-height)',
	},
	action: {},
});
