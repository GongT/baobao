import type { FileBuilder, IOutputShim } from '@build-script/heft-codegen-plugin';
import { camelCase, ucfirst } from '@idlebox/common';
import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const dir = import.meta.dirname;

/** HELPERS START */
import type { ISubArgsReaderApi } from '@idlebox/args';
interface ICmdOpt<T extends object> {
	description: string;
	title: string;
	usage: string;
	help: string;
	parse(subcmd: ISubArgsReaderApi): T;
}
interface ICmdExec<T extends object> extends ICmdOpt<T> {
	execute(options: T): Promise<void> | void;
}
interface generated_element<T extends object> {
	loadArgs(): Promise<ICmdOpt<T>>;
	loadCmd(): Promise<ICmdExec<T>>;
}
/** HELPERS END */

export async function generate(build: FileBuilder, logger: IOutputShim) {
	build.copySection('/** HELPERS START */', '/** HELPERS END */');

	const subdirs = [];
	for (const subdir of await readdir(dir)) {
		const ss = await stat(resolve(dir, subdir));
		if (!ss.isDirectory()) continue;
		subdirs.push(subdir);
	}

	for (const subdir of subdirs) {
		const clsName = ucfirst(camelCase(subdir));
		build.append(`import type {parse as _${clsName}ArgParser} from "./${subdir}/arguments.js";`);
		build.append(`type ${clsName}Arg = ReturnType<typeof _${clsName}ArgParser>;`);
	}

	build.append('export enum CommandKind {');
	for (const subdir of subdirs) {
		const clsName = ucfirst(camelCase(subdir));
		build.append(`\t${clsName} = "${subdir}",`);
	}
	build.append('}');

	build.append('export const known_sub_commands: readonly CommandKind[] = [');
	for (const subdir of subdirs) {
		const clsName = ucfirst(camelCase(subdir));
		build.append(`\tCommandKind.${clsName},`);
	}
	build.append('];');

	build.append('export const commands_define = {');
	for (const subdir of subdirs) {
		const clsName = ucfirst(camelCase(subdir));

		build.append(`\t[CommandKind.${clsName}]: {`);
		build.append('\t\tloadArgs() {');
		build.append(`\t\t\treturn import("./${subdir}/arguments.js");`);
		build.append('\t\t},');
		build.append('\t\tasync loadCmd() {');
		build.append(`\t\t\tconst { run${clsName} } = await import("./${subdir}/execute.js");`);
		build.append(`\t\t\tconst args = await import("./${subdir}/arguments.js");`);
		build.append(`\t\t\treturn { ...args, execute: run${clsName} };`);
		build.append('\t\t},');
		build.append(`\t} satisfies generated_element<${clsName}Arg>,`);
	}
	build.append('} as const;');
}
