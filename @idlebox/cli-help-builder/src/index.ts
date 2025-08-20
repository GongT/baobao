import { c, formatOptions } from './format.js';
import { table } from './table.js';
import type { IArgDefineMap, ICommandDefine } from './types.js';

export * from './types.js';

export class CliApplicationHelp {
	private readonly commands = new Map<string, ICommandDefine>();
	private readonly common_args: IArgDefineMap = {};
	private hasCommonArgs = false;

	public legend_color = '38;5;11';
	public argv0_color = '1';
	public cmd_color = '38;5;10';
	public arg_color = '38;5;14';
	public copt_color = '38;5;3';
	public section_color = '2';

	constructor(
		private readonly argv0: string,
		private readonly description: string,
	) {}

	disableColor() {
		this.legend_color = '';
		this.argv0_color = '';
		this.cmd_color = '';
		this.arg_color = '';
		this.copt_color = '';
		this.section_color = '';
	}

	usage(command?: string): string {
		if (command) {
			if (!this.commands.has(command)) {
				throw new Error(`Command '${command}' is not registered.`);
			}
		}

		const parts = [c(this.argv0_color, this.argv0)];

		if (this.hasCommonArgs) {
			parts.push(c(this.copt_color, '[通用参数]'));
		}

		if (command) {
			const cdef = this.commands.get(command);
			if (!cdef) {
				throw new Error(`Command '${command}' is not registered.`);
			}
			parts.push(c(this.cmd_color, command));

			parts.push(cdef.usage);
		}

		if (!command) {
			if (this.commands.size) {
				parts.push(c(this.cmd_color, '<命令>'), c(this.arg_color, '[命令参数]'));
			}
		}

		return `${this.legend()}\n${c(this.section_color, 'Usage:')}\n    ${parts.join(' ')}\n`;
	}

	legend() {
		return c(this.legend_color, `${this.argv0} - ${this.description}\n`);
	}

	help(command?: string): string {
		const usage = this.usage(command);

		const lines = [usage];

		if (command) {
			const cmd = this.commands.get(command)!;
			const help = cmd.help;
			if (help) {
				lines.push(help);
				lines.push('');
			}
		}

		if (this.hasCommonArgs) {
			lines.push(c(this.section_color, '通用参数:'));
			lines.push(formatOptions(this.common_args, { color: this.copt_color, indent: '    ' }));
		}

		if (command) {
			const cmd = this.commands.get(command)!;
			const m = Array.from(Object.entries(cmd.args));
			if (m.length) {
				const tbl = table(this.arg_color, '    ');
				for (const [name, arg] of m) {
					tbl.line(name, '', arg.description);
				}

				lines.push(c(this.section_color, '命令参数:'), tbl.emit());
			}
		} else if (this.commands.size) {
			lines.push(c(this.section_color, '全部命令:'));
			const tbl = table(this.cmd_color, ' * ');
			for (const [name, cmd] of this.commands.entries()) {
				tbl.line(name, '', cmd.description);
			}
			lines.push(tbl.emit());
		}
		lines.push('');

		return lines.join('\n');
	}

	registerCommand(command: string, cdef: ICommandDefine) {
		if (this.commands.has(command)) {
			throw new Error(`Command '${command}' is already registered.`);
		}
		this.commands.set(command, cdef);
		if (cdef.commonArgs) this.registerCommonArgs(cdef.commonArgs);
	}

	registerCommands(cdef: Record<string, ICommandDefine>) {
		for (const [command, def] of Object.entries(cdef)) {
			this.registerCommand(command, def);
		}
	}

	registerCommonArgs(map: IArgDefineMap) {
		const keys = Object.keys(map);
		if (keys.length === 0) return;

		for (const item of keys) {
			if (Object.hasOwn(this.common_args, item)) {
				throw new Error(`common argument '${item}' is already registered.`);
			}
		}

		this.hasCommonArgs = true;
		Object.assign(this.common_args, map);
	}
}
