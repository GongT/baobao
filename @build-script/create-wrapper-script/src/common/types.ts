import type { WorkspaceBase } from '@build-script/monorepo-lib';

export type ScriptKind = 'bash' | 'powershell';

export interface IOptions {
	/**
	 * 目标脚本的路径
	 */
	readonly targetFile: string;
	/**
	 * 包装脚本的路径
	 */
	readonly wrapperFile: string;

	// 脚本类型，如果未指定，将根据当前平台自动选择。
	readonly type?: ScriptKind;
	/**
	 * 关联的工作区，用于计算相对路径
	 *
	 * 如果不设置，脚本中将使用绝对路径
	 */
	readonly workspace?: WorkspaceBase | string;

	/**
	 * 写文件
	 */
	writeFile?(file: string, content: string): Promise<any>;
}

export interface IExtOpt {
	/**
	 * 目标脚本的路径，可能是相对路径或绝对路径
	 */
	readonly targetFile: string;
	/**
	 * 包装脚本的文件路径，包含ps1，但不会有.sh
	 */
	readonly wrapperFile: string;
	/**
	 * 包装脚本所在的根目录，用于计算相对路径
	 */
	readonly root?: string;
	writeFile(file: string, content: string): Promise<any>;
}

export interface IPaths {
	readonly paths: readonly string[];
	readonly shebangInterpreter?: string;
	readonly shebangCommand?: string;
	readonly extensionInterpreter?: string[];

	relative(file: string, must?: boolean): string;
}
