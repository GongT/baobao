import { CloseOutlined } from '@ant-design/icons';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Button, Flex, Progress, Typography } from 'antd';
import { forwardRef, useEffect } from 'react';
import { DropControlState, HoverState, Reset, uploaderProps, UploadStage, type IUploaderUiProps } from './context.js';

interface IAdditionalProps {
	readonly className?: string;
	readonly idleText?: boolean;
}

const useStyles = makeStyles({
	container: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	text: {
		padding: '0 1em',
		flex: 1,
		textAlign: 'left',
		'--ant-line-height': 'var(--ant-control-height)',
		whiteSpace: 'nowrap',
	},
	progress: {
		flex: '50%',
	},
	idleText: {
		color: 'var(--ant-color-primary)',
	},
	textDisabled: {
		color: 'var(--ant-color-text-disabled)',
	},
});

export const FileDropZoneLine = forwardRef<HTMLDivElement, IAdditionalProps>((props: IAdditionalProps, ref) => {
	const classes = useStyles();

	const { aborter, hover, percent, state, error, type, stage, disabled, currentFile, totalFiles, idleText, ...additionalProps } = props as IUploaderUiProps &
		IAdditionalProps;

	const { what, icon } = uploaderProps[type];

	function handleCancelUpload() {
		aborter.abort(new Error('用户主动取消上传'));
	}
	function handleDelete() {
		aborter.abort(new Reset());
	}

	useEffect(() => {
		if (state === DropControlState.Success) {
			setTimeout(handleDelete, 1000);
		}
	}, [state]);

	let button: React.ReactNode = null;
	let message: React.ReactNode = '';
	let body: React.ReactNode = null;
	if (state === DropControlState.Idle) {
		message =
			idleText === false ? null : (
				<Typography.Text className={mergeClasses(classes.idleText, disabled ? classes.textDisabled : undefined)}>点击或拖拽{what}到此处上传</Typography.Text>
			);
		switch (hover) {
			case HoverState.None:
				button = (
					<Button color="primary" disabled={disabled} icon={icon} variant="solid">
						上传{what}
					</Button>
				);
				break;
			case HoverState.WillAccept:
				button = (
					<Button color="green" disabled={disabled} icon={icon} variant="solid">
						松开上传
					</Button>
				);
				break;
			case HoverState.WillReject:
				body = (
					<Button color="danger" disabled icon={<CloseOutlined />} variant="solid">
						错误文件
					</Button>
				);
				break;
		}
	} else if (state === DropControlState.Uploading) {
		switch (stage) {
			case UploadStage.Finished:
				message = ``;
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
		button = (
			<Button color="danger" icon={<CloseOutlined />} loading onClick={handleCancelUpload} variant="solid">
				取消上传
			</Button>
		);
		body = <Progress className={classes.progress} percent={percent} type="line" />;
	} else if (state === DropControlState.PostProcessing) {
		message = `请稍候……`;
		button = (
			<Button color="primary" loading onClick={handleCancelUpload} variant="solid">
				处理中
			</Button>
		);
	} else if (state === DropControlState.Success) {
		// effect
		message = '';
		button = (
			<Button color="green" loading onClick={handleCancelUpload} variant="solid">
				已完成
			</Button>
		);
		body = <Progress className={classes.progress} percent={percent} type="line" />;
	} else {
		body = <Typography.Text className={classes.text}>上传失败: {error?.message}</Typography.Text>;
	}

	return (
		<Flex align="center" className={classes.container} justify="space-between" {...additionalProps} ref={ref}>
			{button}
			<Typography.Text className={classes.text}>{message}</Typography.Text>
			{body}
		</Flex>
	);
});
