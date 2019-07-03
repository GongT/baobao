import { basename } from 'path';
import { ParsedCommandLine } from 'typescript';

export function filterIgnoreFiles(command: ParsedCommandLine): string[] {
	return command.fileNames.filter((file: string) => {
		return !isFileIgnored(file);
	});
}

const ignored = /^_|\.test\.ts$/;

export function isFileIgnored(path: string) {
	return ignored.test(basename(path));
}