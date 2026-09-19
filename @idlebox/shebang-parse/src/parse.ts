import { split } from 'split-cmd';
import { envFlagArgs, envValueArgs } from '#manpage';

const shebangLine = /^(\S+)(?:\s+([\s\S]*))?$/;
const splitArgument = /^(-S|--split-string=)($|\s)/;

function basename(path: string): string {
	const slashIdx = path.lastIndexOf('/');
	return slashIdx === -1 ? path : path.slice(slashIdx + 1);
}

/**
 * 拆分 shebang 行（解释器 + 参数）
 */
export class ShebangLine {
	/**
	 * 解释器
	 */
	public readonly command: string;
	/**
	 * 解释器的参数
	 */
	public readonly argument?: string;
	public env_args?: readonly string[];

	/**
	 * 是否使用了 env 作为解释器
	 */
	public readonly isEnv: boolean;

	constructor(line: string) {
		const trimmed = line.trimEnd();
		if (!trimmed.startsWith('#!')) {
			throw new Error(`not a shebang line: "${line}"`);
		}

		// Remove "#!" and trim leading whitespace after it.
		const body = trimmed.slice(2).trimStart();

		// Split on the first whitespace boundary only.
		const match = body.match(shebangLine);
		if (!match) {
			throw new Error(`invalid shebang line: "${line}"`);
		}

		this.command = match[1];
		this.argument = match[2];
		this.isEnv = basename(this.command) === 'env';
	}

	get isSpliting(): boolean {
		if (!this.isEnv || !this.argument) return false;

		/**
		 * 两个事实:
		 *   1. env只允许-S在开头，且-S=的行为非常奇怪正常不会出现 | --split-string 也是，并且必须要加=，且=后面不能有东西
		 *   2. argument前后空格已经删除
		 */
		return splitArgument.test(this.argument);
	}

	private useArgs() {
		if (!this.isEnv) throw new Error('not using env as interpreter');
		if (!this.argument) this.env_args = [];
		else if (!this.env_args) this.env_args = split(this.argument);
		return this.env_args;
	}

	/**
	 * 如果是env，拆分env的参数和实际命令部分
	 */
	split(): ISplitResult {
		const opts: string[] = [];
		const argv = [...this.useArgs()];
		while (true) {
			const item = argv.shift();
			if (!item) break;

			if (envFlagArgs.includes(item)) {
				opts.push(item);
				continue;
			} else if (envValueArgs.includes(item)) {
				if (item === '-S' || item === '--split-string') {
					opts.push(item);
				} else {
					const next = argv.shift();
					if (!next) {
						throw new Error(`expected value after ${item}`);
					}
					opts.push(`${item}=${next}`);
				}
				continue;
			}

			const param = envValueArgs.find((arg) => item.startsWith(`${arg}=`));
			if (param) {
				opts.push(item);
			} else {
				argv.unshift(item);
				break;
			}
		}

		if (this.isSpliting) {
			return {
				spliting: true,
				opts,
				command: argv,
			};
		} else {
			return {
				spliting: false,
				opts,
				command: rebuild_command(argv),
			};
		}
	}
}

type ISplitResult =
	| {
			/**
			 * 是否拆分了 env 的参数
			 */
			spliting: false;
			/**
			 * env 的参数列表
			 */
			opts: string[];
			/**
			 * 实际要执行的命令
			 */
			command: string;
	  }
	| {
			/**
			 * 是否拆分了 env 的参数
			 */
			spliting: true;
			/**
			 * env 的参数列表
			 */
			opts: string[];
			/**
			 * 实际要执行的命令
			 */
			command: string[];
	  };

function rebuild_command(argv: string[]): string {
	return argv.map((arg) => JSON.stringify(arg)).join(' ');
}
