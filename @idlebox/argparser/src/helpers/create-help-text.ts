import { ArgumentCommand, ArgumentOption } from '../main';
import { wrapStringBlock } from './chunk';
import { columns } from './tty';

export function createCommandHelp(cmd: ArgumentCommand) {
	let r = 'Usage: ';
	r += `${cmd.parent} ${cmd.name}`;
	if (cmd.options.size) {
		r += ' ';
		const required = Array.from(cmd.options.values()).some((x) => x.required);
		r += required ? '<' : '[';
		r += `...options`;
		r += required ? '>' : ']';
	}
	if (cmd.commands.size > 0) {
		r += ' ';
		const required = cmd.subCommandRequired;
		r += required ? '<' : '[';
		r += `...options`;
		r += required ? '>' : ']';
		r += ' [...sub options]';
	}
	if (cmd.allowExtraOptions) {
		r += ' <inputs>';
	}

	r += '\n';

	if (cmd.description) {
		r += '\n    ';
		r += wrapStringBlock(cmd.description, columns - 4, '    ');
		r += '\n\n';
	}

	const varSize = Math.max(
		...Array.from(cmd.commands.values()).map((x) => x.name.length),
		...Array.from(cmd.options.values()).map((x) => x.helpVar.length),
	);
	const lft = columns - varSize - 8;

	if (cmd.commands.size > 0) {
		r += 'Available commands:\n';
		for (const sub of cmd.commands.values()) {
			r += `    ${sub.name.padEnd(varSize, ' ')}    `;
			r += wrapStringBlock(sub.help, lft, ' '.repeat(varSize + 8));
			r += '\n';
		}
		r += '\n';
	}
	if (cmd.options.size > 0) {
		r += 'Options:\n';
		for (const option of cmd.options.values()) {
			r += createOptionHelp(option, varSize);
			r += '\n';
		}
	}
}

export function createOptionHelp(option: ArgumentOption, varSize: number, long = false) {
	let r = '    ';

	r += option.helpVar.padEnd(varSize, ' ');
	r += '    ';

	const lft = columns - varSize - 8;
	r += wrapStringBlock(long ? option.description ?? option.help : option.help, lft, ' '.repeat(varSize + 8));

	return r;
}
