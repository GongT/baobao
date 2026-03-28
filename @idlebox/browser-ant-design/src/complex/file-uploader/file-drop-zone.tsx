import { listenOnAbort, useAbort } from '@idlebox/browser-react';
import React, { useState } from 'react';
import { useDropzone, type FileError } from 'react-dropzone';
import { useEnhancedFormItem } from '../../component/form/enhanced-form.jsx';
import { DropControlState, HoverState, UploadKind, UploadStage, type IUploaderUiProps } from './context.js';

interface IFileDropZoneProps {
	readonly type: UploadKind;

	/// 作为form input
	readonly id?: string;
	// 忽略: readonly value: string;
	/**
	 * 上传完成后触发
	 */
	readonly onChange?: (id: string, file: File) => void;

	/// 其他参数
	readonly multiple?: boolean;
	readonly children: React.ReactElement<IUploaderUiProps>;
	readonly disabled?: boolean;

	/**
	 * 测试拖进来的文件是否合法，返回错误信息或者null
	 */
	readonly validator?: (file: File) => FileError | null;

	/**
	 * 上传前的钩子函数，返回 false 可以跳过上传
	 */
	readonly onBeforeUpload?: (file: File) => boolean | undefined | Promise<boolean | undefined>;

	/**
	 * 实际调用上传过程，内部通过callbacks控制进度
	 * 返回字符串表示的文件ID，该ID将会用于调用onChange的第一个参数
	 */
	doUploadFile(file: File, callbacks: IUploaderCallbacks): Promise<string>;

	/**
	 * 传入回调进行后处理
	 */
	readonly postProcessing?: (id: string, file: File) => Promise<void>;
}

export interface IUploaderCallbacks {
	/**
	 * 用户点击取消按钮
	 */
	readonly abort: AbortSignal;
	/**
	 * 调用此函数更新UI状态
	 */
	readonly changeState: (stage: UploadStage, progress?: number) => void;
}

interface BusyState {
	state: DropControlState;
	error?: Error;
}

function getMime(type: UploadKind) {
	switch (type) {
		case UploadKind.Raw:
			return undefined;
		case UploadKind.Image:
			return 'image/*';
		case UploadKind.Video:
			return 'video/*';
		case UploadKind.AndroidApk:
			return 'application/vnd.android.package-archive';
		default:
			// @ts-expect-error 如果此行报错说明上面case不全
			throw new Error(`未知的 UploadKind: ${type.toString()}`);
	}
}

export function FileDropZone({
	disabled: propDisabled,
	multiple,
	id,
	type,
	onChange,
	validator,
	onBeforeUpload,
	children,
	doUploadFile: handleUploadFile,
	postProcessing,
}: IFileDropZoneProps) {
	const formProps = useEnhancedFormItem({ disabled: propDisabled });
	const aborter = useAbort();
	const mime = getMime(type);

	const [percent, setPercent] = useState(0);
	const [enter, _setEnter] = useState(false);

	const [state, setState] = useState<BusyState>({ state: DropControlState.Idle });
	const [totalFiles, setTotalFiles] = useState(0);
	const [currentFile, setCurrentFile] = useState(0);
	const [stage, setUploadStage] = useState(UploadStage.Finished);
	const acceptUpload = (state.state === DropControlState.Idle || state.state === DropControlState.Error) && !formProps.disabled;
	const disableDrop = state.state === DropControlState.Success && !formProps.disabled;

	listenOnAbort(aborter, () => {
		// console.log('abort fired');
		if (state.state === DropControlState.Success) {
			setState({ state: DropControlState.Idle });
		}
	});

	const { isDragReject, getRootProps, getInputProps } = useDropzone({
		multiple: multiple ?? false,
		preventDropOnDocument: true,
		// maxFiles: 1,
		noDrag: formProps.disabled,
		noClick: !acceptUpload || disableDrop,
		noKeyboard: true,
		accept:
			// acceptUpload?
			mime
				? {
						[mime]: [],
					}
				: {},
		// : { 'this-state-not-allow/anything': [] },
		validator(file: File) {
			if (!acceptUpload) {
				return { code: 'too-many-files', message: '当前状态不允许上传文件' };
			}
			return validator?.(file) ?? null;
		},
		async onDropAccepted(files: File[]) {
			if (!files[0]) return;

			setTotalFiles(files.length);
			for (const file of files) {
				setCurrentFile(files.indexOf(file));
				const go = await doUploadFile(file);
				if (!go) break;
			}
		},
		onDrop() {
			_setEnter(false);
		},
		onDragEnter() {
			if (state.state === DropControlState.Error) setState({ state: DropControlState.Idle });
			_setEnter(true);
		},
		onDragLeave() {
			if (state.state === DropControlState.Error) setState({ state: DropControlState.Idle });
			_setEnter(false);
		},
	});

	async function doUploadFile(file: File) {
		if (!acceptUpload) {
			throw new Error(`Cannot upload in current state (${state})`);
		}

		setState({ state: DropControlState.Uploading });
		try {
			if (onBeforeUpload) {
				const shouldUpload = await onBeforeUpload(file);
				if (shouldUpload === false) {
					return true;
				}
			}

			const rid = await handleUploadFile(file, {
				abort: aborter.signal,
				changeState(stage, progress) {
					setPercent(progress ?? -1);
					setUploadStage(stage);
				},
			});

			if (postProcessing) {
				setState({ state: DropControlState.PostProcessing });
				await postProcessing(rid, file);
			}

			setState({ state: DropControlState.Success });

			if (onChange) {
				setTimeout(() => {
					onChange(rid, file);
				}, 0);
			}
			return true;
		} catch (e) {
			setState({ state: DropControlState.Error, error: e as Error });
			return false;
		}
	}

	if (!React.isValidElement(children)) {
		throw new Error(`FileDropZone 的 children 必须是单个 React 元素`);
	}

	const cloneProps = getRootProps({ disabled: formProps.disabled });

	const hover = enter ? (isDragReject ? HoverState.WillReject : HoverState.WillAccept) : HoverState.None;
	const props: IUploaderUiProps = {
		...cloneProps,
		aborter: aborter,
		error: state.error,
		type: type,
		hover: hover,
		percent: percent,
		state: state.state,
		stage: stage,
		totalFiles,
		currentFile,
	};

	return (
		<>
			<input {...getInputProps({ disabled: formProps.disabled })} id={id} />
			{React.cloneElement(children, {
				...children.props,
				...props,
				...formProps,
			})}
		</>
	);
}
