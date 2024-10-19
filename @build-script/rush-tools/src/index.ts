import { ArgumentError, createArgsReader, ISubArgsReaderApi, printTwoColumn } from '@idlebox/args';
import { commands_define, known_sub_commands, type CommandKind } from './commands/all.generated.js';

export default async function main() {
	let sub: ISubArgsReaderApi<CommandKind> | undefined;
	try {
		const command = createArgsReader(process.argv.slice(2));
		sub = command.command(known_sub_commands);
		const help = command.flag(['--help', '-h']) > 0;
		if (help) {
			await printUsage(sub?.value);
			// console.log('Usage: rush-tools <command> [options]');

			// // TODO
			// console.log('Commands:');
			// for (const key of known_sub_commands) {
			// 	console.log(`  ${key}`);
			// }
			return 0;
		}

		if (!sub) {
			const got = command.at(0);
			if (got) {
				throw new ArgumentError(`invalid command: ${got}`);
			}
			throw new ArgumentError(`missing command`);
		}

		const { parse, execute } = await commands_define[sub.value].loadCmd();
		const options = await parse(sub);

		const unused = command.unused();
		if (unused.length > 0) {
			throw new ArgumentError(`unknown arguments: ${unused.join(' ')}`);
		}

		await execute(options);

		return 0;
	} catch (e: unknown) {
		if (e instanceof ArgumentError) {
			console.error(`\n\t\x1B[38;5;9m%s\x1B[0m\n`, e.message);
			await printUsage(sub?.value);
			return 1;
		}
		throw e;
	}
}
async function printUsage(subcmd: CommandKind | undefined) {
	if (subcmd) {
		const { description, help, usage } = await commands_define[subcmd].loadArgs();
		console.log(`Usage: rush-tools ${subcmd} \x1b[38;5;14m${usage}\x1b[0m
    ${description}

${help.replace(/^\S/gm, '  $&').replace(/^\t/gm, '      ')}`);
	} else {
		console.log('Usage: rush-tools <command> [options]');
		const table: [string, string][] = [];
		for (const [command, { loadArgs }] of Object.entries(commands_define)) {
			const { title } = await loadArgs();

			table.push([`    ${command}:`, title]);
		}

		printTwoColumn(table);
	}
}
