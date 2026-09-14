import { HeredocWaitter } from './heredoc';

const dockerInstructions = [
	'ADD',
	'ARG',
	'CMD',
	'COPY',
	'ENTRYPOINT',
	'ENV',
	'EXPOSE',
	'FROM',
	'HEALTHCHECK',
	'LABEL',
	'MAINTAINER',
	'ONBUILD',
	'RUN',
	'SHELL',
	'STOPSIGNAL',
	'USER',
	'VOLUME',
	'WORKDIR',
] as const;
export type DockerInstruction = (typeof dockerInstructions)[number];
export const DockerInstructions: ReadonlyArray<DockerInstruction> = dockerInstructions;

export interface IComment {
	type: 'comment';

	// 注释所在的行号（从0开始）
	lineno: number;
	// 注释的内容
	lines: string;
}

export type IInstruction<Inst extends string = string> = iInstruction<Inst>;
interface iInstruction<Inst extends string> {
	type: 'instruction';

	// 指令所在的行号（从0开始）
	lineno: number;
	// 指令的类型，例如 ADD、COPY、RUN 等
	cmd: Uppercase<Inst>;
	/**
	 * 指令的内容，包括指令本身，且指令必定处于开头并大写
	 *
	 * `  FrOm    xxx` -> `FROM xxx`
	 */
	lines: string;
}

function escape(str: string) {
	return RegExp.escape(str);
}

function assert(condition: any, message?: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

export class DockerfileParser<InstructionSet extends ReadonlyArray<string> = DockerInstruction[]> {
	private readonly instReg: RegExp;

	constructor(public readonly instructionSet: InstructionSet = DockerInstructions as any) {
		this.instReg = new RegExp(`^(${instructionSet.map(escape).join('|')})\\s+`, 'i');
	}

	/**
	 * 将Dockerfile分段，每个分段是一个指令或一个注释。
	 *
	 * 其中空行也认为是一种注释。
	 * 每个段的内容均去除最终换行，例如连续 N 个空行作为注释将会得到 N-1 个\n组成的字符串。
	 *
	 * 绝大部分行尾空格将会被去除、指令行的开头空格也会被去除。
	 */
	parse(text: string): Array<iInstruction<DockerInstruction> | IComment> {
		const raw_lines = text.split('\n');
		const result: Array<iInstruction<DockerInstruction> | IComment> = [];

		let current: iInstruction<DockerInstruction> | IComment | undefined;
		const heredoc = new HeredocWaitter();

		function replace(replace?: iInstruction<DockerInstruction> | IComment) {
			if (!current) {
				current = replace;
				return;
			}

			// 合并注释
			if (current.type === 'comment' && replace?.type === 'comment') {
				current.lines += '\n';
				current.lines += replace.lines;
				return;
			}

			result.push(current);
			current = replace;
		}

		for (const [lineno, raw_line] of raw_lines.entries()) {
			const line = raw_line.trim();

			if (heredoc.active) {
				// heredoc状态
				heredoc.handle(line);

				// heredoc 内容行添加到指令行，并且必须保持原始格式
				assert(current, '当前没有指令与 heredoc 关联');
				current.lines += `\n${raw_line}`;

				continue;
			}

			const i = this.testInstStarting(line);
			if (i) {
				// 遇到指令起点
				replace({
					type: 'instruction',
					...i,
					lineno,
				});

				heredoc.handle(line);

				continue;
			}

			if (line.startsWith('#') || !line) {
				// 空行也是一种注释
				replace({ type: 'comment', lines: raw_line.trimEnd(), lineno });
				continue;
			}

			if (!current) {
				// 开头没有指令、注释后出现了孤立语句
				throw new Error(`无法解析Dockerfile: 发现孤立语句: ${raw_line}`);
			}

			// 语句后续行
			heredoc.handle(line);
			current.lines += `\n${raw_line.trimEnd()}`;
		}

		replace();

		return result;
	}

	private testInstStarting(line: string) {
		const m = this.instReg.exec(line);
		if (!m) return undefined;

		let [m0, inst] = m;
		const args = line.slice(m0.length).trimStart();
		if (inst.toUpperCase() !== inst) {
			console.warn(`发现小写docker build命令: ${line}`);
			inst = inst.toUpperCase();
		}
		return {
			cmd: inst as DockerInstruction,
			lines: `${inst} ${args}`,
		};
	}
}

/**
 * 将对象转换成 Dockerfile 中的 ARG 指令字符串
 */
export function serializeDockerfileArg(data: Record<string, string | undefined>) {
	const r = ['ARG'];
	for (const [k, v] of Object.entries(data)) {
		if (k.toUpperCase() !== k) {
			console.warn(`构建参数 ${k} 不是全大写`);
		}

		let line = `${k}`;
		if (v !== undefined) {
			line += `=${JSON.stringify(v)}`;
		}
		r.push(line);
	}
	return r.join(' ');
}
