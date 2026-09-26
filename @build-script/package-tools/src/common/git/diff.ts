import { fixedWidth, limitWidth, stringWidth } from 'cjke-strings';

const gitDiffLine = /^diff --git a\/(.+?) b\/.+$/;
const gitIndexLine = /^index ([0-9a-f]+)\.\.([0-9a-f]+) (\d+)$/;

interface IGitPatchInfo {
	// git命令
	command?: {
		// diff --git a/xxxx b/yyyy
		raw: string;
		// 文件路径
		path: string;
	};

	index?: {
		// 新文件hash
		current: string;
		// 旧文件hash
		previous: string;
		// 文件模式
		mode: string;
	};
}

export interface IFileHeading {
	// 新文件
	current: string;
	// 旧文件
	previous: string;
	// git额外信息
	git?: IGitPatchInfo;
	// 其他未知行
	others?: string[];
}

interface IDumpOptions {
	// 文件差异对齐时的表头，包含旧文件和新文件的标题
	readonly heading?: [/* old = */ string, /* new = */ string];

	readonly lineLimit?: number;

	readonly context?: boolean;

	// 是否在输出时显示行号（@@ 开头的行）
	readonly blockHeading?: boolean;

	readonly sep?: string;
}

const splitterReg = /\n(?=diff --git a\/)/;
/**
 * 将一个完整的git diff内容拆分为多个FileDiffOp实例，每个实例表示一个文件的差异块。
 * 根据“diff --git”切割
 */
export function splitPatchFile(content: string): FileDiffOp[] {
	const parts: FileDiffOp[] = [];
	const chunks = content.split(splitterReg);
	for (const chunk of chunks) {
		if (chunk.trim().length > 0) {
			parts.push(new FileDiffOp(chunk));
		}
	}
	return parts;
}

interface IDiffOptions {
	readonly maxLineWidth: number;
}

export class FileDiffOp {
	private readonly body: readonly string[];
	private readonly header: readonly string[];
	private readonly options: IDiffOptions;

	constructor(
		public readonly raw: string,
		options: Partial<IDiffOptions> = {},
	) {
		const lines = raw.toString().trim().split('\n');

		let headerLine = lines.findIndex((line) => line.startsWith('@@ '));
		if (headerLine === -1) {
			// 文件并没有变化，例如只有mode变化时会出现
			// logger.warn`diff中找不到 @@, 内容:\nlist<${lines}>`;
			headerLine = lines.length;
		}

		this.header = lines.slice(0, headerLine);
		this.body = lines.slice(headerLine);
		this.options = {
			maxLineWidth: options.maxLineWidth ?? 35,
		};
	}

	parseHeader(): IFileHeading {
		const result: IFileHeading = { current: '', previous: '' };
		const git = () => {
			if (!result.git) result.git = {};
			return result.git;
		};
		const un = (line: string) => {
			if (!result.others) result.others = [];
			result.others.push(line);
		};

		for (const line of this.header) {
			if (line.startsWith('--- ')) {
				result.previous = line.slice(4).trim();
				continue;
			} else if (line.startsWith('+++ ')) {
				result.current = line.slice(4).trim();
				continue;
			}

			const mA = line.match(gitDiffLine);
			if (mA) {
				git().command = { raw: line, path: mA[1] };
				continue;
			}

			const mB = line.match(gitIndexLine);
			if (mB) {
				git().index = {
					previous: mB[1],
					current: mB[2],
					mode: mB[3],
				};
				continue;
			}

			un(line);
		}
		return result;
	}

	private limitCache?: string[];
	limitedBody() {
		if (!this.limitCache) {
			this.limitCache = this.body.map((s) => {
				const { result, remaining } = limitWidth(s, this.options.maxLineWidth);
				if (remaining) {
					return `${result}...`;
				} else {
					return result;
				}
			});
		}
		return this.limitCache;
	}

	lines() {
		return this.limitedBody()[Symbol.iterator]();
	}

	/**
	 * 迭代文件差异块，每个块以 "@@ " 开头，返回每行的数组
	 */
	*blocks() {
		let block: string[] = [];
		for (const line of this.limitedBody()) {
			if (line.startsWith('@@ ')) {
				if (block.length > 0) {
					yield block;
				}
				block = [line];
			} else {
				block.push(line);
			}
		}
		if (block.length > 0) {
			yield block;
		}
	}

	sideBySide(options?: IDumpOptions) {
		const parts: IPart[] = [];
		let maxLines = options?.lineLimit ?? Infinity;
		const sepChar = options?.sep?.at(0) || '|';
		const sep = ` ${sepChar} `;
		for (const block of this.blocks()) {
			const info = new BlockInfo(block);
			if (options?.blockHeading) {
				maxLines++;
				parts.push({ changes: false, lines: [info.head] });
			}

			if (options?.context === false) {
				for (const part of info.iterate()) {
					if (!part.changes) continue;
					parts.push(part);
				}
			} else {
				parts.push(...info.iterate());
			}
		}

		let lineCnt = 0;
		let maxOldLine = 0;
		if (options?.heading?.[0]) {
			maxOldLine = stringWidth(options.heading[0]);
		}
		for (const block of parts) {
			if (!block.changes) {
				lineCnt += block.lines.length;
				if (lineCnt >= maxLines) break;
				continue;
			}

			for (const line of block.oldLines) {
				maxOldLine = Math.max(maxOldLine, stringWidth(line));
				lineCnt++;
				if (lineCnt >= maxLines) break;
			}
		}

		maxOldLine += 8;

		lineCnt = 0;
		let diff = '';
		if (options?.heading) {
			diff += fixedWidth(options.heading[0] ?? '', maxOldLine);
			diff += sep;
			if (options.heading[1]) diff += options.heading[1];
			diff += '\n';
		}
		for (const block of parts) {
			if (!block.changes) {
				diff += `${block.lines.join('\n')}\n`;
				lineCnt += block.lines.length;
				if (lineCnt >= maxLines) break;
				continue;
			}
			for (let i = 0; i < Math.max(block.oldLines.length, block.newLines.length); i++) {
				const oldLine = block.oldLines[i] || '';
				const newLine = block.newLines[i] || '';
				// diff += `${fixedWidth(oldLine, maxOldLine)} ${sep} ${newLine}\n`;
				diff += fixedWidth(oldLine, maxOldLine);
				diff += sep;
				diff += newLine;
				diff += '\n';
				lineCnt++;
				if (lineCnt >= maxLines) break;
			}
		}
		return diff;
	}
}

type IPart =
	| {
			readonly changes: false;
			readonly lines: string[];
	  }
	| {
			readonly changes: true;
			readonly oldLines: string[];
			readonly newLines: string[];
	  };

const blockStartReg = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@(.*)$/;

interface IRange {
	// 起始行
	readonly start: number;
	// 行数
	readonly count: number;
}

export interface IBlockHeading {
	// 旧文件
	readonly previous: IRange;
	// 新文件
	readonly current: IRange;
	// 头部注释
	readonly comment: string;
}

/**
 * 表示一个文件差异块（@@ ... @@）
 */
export class BlockInfo {
	constructor(readonly lines: readonly string[]) {}

	get head() {
		return this.lines[0];
	}

	parseHead(): IBlockHeading {
		const match = this.head.match(blockStartReg);
		if (!match) {
			throw new Error('无法解析文件差异块的头部');
		}
		return {
			previous: {
				start: Number.parseInt(match[1], 10),
				count: match[2] ? Number.parseInt(match[2], 10) : 0,
			},
			current: {
				start: Number.parseInt(match[3], 10),
				count: match[4] ? Number.parseInt(match[4], 10) : 0,
			},
			comment: match[5]?.trim() || '',
		};
	}

	get body(): ReadonlyArray<string> {
		return this.lines.slice(1);
	}

	*iterate(): Generator<IPart> {
		let part: IPart = { changes: false, lines: [] };

		for (const line of this.body) {
			if (line.startsWith(' ')) {
				if (part.changes) {
					if (part.newLines.length > 0 || part.oldLines.length > 0) {
						yield part;
					}
					part = { changes: false, lines: [] };
				}
				part.lines.push(line.slice(1));
			} else {
				if (!part.changes) {
					if (part.lines.length > 0) {
						yield part;
					}
					part = { changes: true, oldLines: [], newLines: [] };
				}

				if (line.startsWith('+')) {
					part.newLines.push(line.slice(1));
				} else if (line.startsWith('-')) {
					part.oldLines.push(line.slice(1));
				} else if (line.startsWith('Binary files ')) {
					// 忽略此行 ... ?
				} else if (line === '\\ No newline at end of file') {
					// 忽略此行
				} else {
					throw new Error(`无法解析的行: ${line}`);
				}
			}
		}

		if (part.changes) {
			if (part.newLines.length > 0 || part.oldLines.length > 0) {
				yield part;
			}
		} else {
			if (part.lines.length > 0) {
				yield part;
			}
		}
	}
}
