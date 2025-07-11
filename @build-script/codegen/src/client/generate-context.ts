import { loadInheritedJson } from '@idlebox/json-extends-loader';
import type { ILogger } from '../common/output.js';
import { typescriptAlertHeader } from './alert-header.js';
import { FileBuilder } from './file-builder.js';

export interface IGenerateContext extends Context {}

export type GenerateContext = Omit<IGenerateContext, 'emitFiles'>;

const isSourceFile = /\.tsx?$/i;

export class Context {
	private readonly files: FileBuilder[] = [];
	private readonly _watchFiles: Set<string> = new Set<string>();

	constructor(
		public readonly sourceFile: string, // absolute
		public readonly logger: ILogger,
		public readonly projectRoot: string,
	) {}

	/**
	 * 将文件添加到监听列表中，如果任意文件发生更改，生成器将重新运行
	 *
	 * *注意: 如果需要监听文件夹，则必须以 / 结尾*
	 * 所有源代码（自身和 import() 的文件）将自动添加到列表中，不需要手动添加
	 *
	 * @param files 要添加到监听列表的文件
	 */
	watchFiles(...files: string[]) {
		for (const file of files) {
			this._watchFiles.add(file);
		}
	}

	/**
	 * 加载带有 "extends" 字段的链式 JSON 文件，例如 tsconfig.json
	 */
	async readExtendsJson(file: string) {
		this.watchFiles(file);
		return loadInheritedJson(file);
	}

	get watchingFiles(): ReadonlySet<string> {
		return this._watchFiles;
	}

	/**
	 * 创建一个文件
	 * @param name 文件名，如果以/开头，则表示相对于项目根目录的路径，如果以.开头，则表示相对于源文件的路径
	 */
	file(name: string) {
		const writer = new FileBuilder(this.projectRoot, this.sourceFile, name, this.logger);

		if (this.files.some((file) => file.absolutePath === writer.absolutePath)) {
			throw new Error(`File ${name} already exists in the context.`);
		}

		this.files.push(writer);
		return writer;
	}

	/** @internal */
	__commit() {
		return this.files.map((file) => {
			const path = file.absolutePath;
			let content = file.toString();
			if (isSourceFile.test(path)) {
				content = typescriptAlertHeader + content;
			}
			return { path, content };
		});
	}

	get size() {
		return this.files.length;
	}
}
