import { AndroidFilled, FileImageOutlined, FileUnknownOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import { NotError } from '@idlebox/common';

export enum UploadStage {
	Hashing,
	Preparing,
	Uploading,
	Finished,
}

export enum UploadKind {
	Raw = 'raw',
	AndroidApk = 'android',
	Image = 'image',
	Video = 'video',
}

export enum DropControlState {
	// 什么都没做（初始）以及上传出错后
	Idle = 'idle',

	// 上传中（hash、上传）
	Uploading = 'uploading',

	// 后处理
	PostProcessing = 'post-processing',

	// 完成状态
	Success = 'success',

	Error = 'error',
}

export enum HoverState {
	// 没有
	None = 'none-hover',

	// 鼠标拖着文件在上面
	WillAccept = 'will-accept',
	WillReject = 'will-reject',
}

export interface IUploaderUiProps {
	readonly type: UploadKind;
	readonly state: DropControlState;
	readonly hover: HoverState;
	readonly disabled: boolean;

	readonly totalFiles: number;
	readonly currentFile: number;

	// 只有Error stage才可能有
	readonly error?: Error;

	// 上传过程，只有Uploading stage才有
	readonly stage?: UploadStage;
	readonly percent: number;

	// 始终都存在，但不一定会触发
	readonly aborter: AbortController;
}

// export const uploaderContext = createContext<IUploaderContext>(undefined as any);
// uploaderContext.displayName = 'UploaderContext';

interface DefaultUploadProps {
	readonly what: string;
	readonly icon: React.ReactNode;
}

export const uploaderProps: Record<UploadKind, DefaultUploadProps> = {
	[UploadKind.Raw]: {
		what: '文件',
		icon: <FileUnknownOutlined />,
	},
	[UploadKind.Image]: {
		what: '图片',
		icon: <FileImageOutlined />,
	},
	[UploadKind.Video]: {
		what: '视频',
		icon: <VideoCameraAddOutlined />,
	},
	[UploadKind.AndroidApk]: {
		what: 'apk文件',
		icon: <AndroidFilled />,
	},
};

export class Reset extends NotError {
	constructor() {
		super('重置Uploader状态');
	}
}
