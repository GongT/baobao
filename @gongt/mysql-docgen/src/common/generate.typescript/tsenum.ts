import { resolve } from 'path';
import { camelCase, linux_case, ucfirst } from '@idlebox/common';
import { info } from 'fancy-log';
import { createWriteStream } from 'fs/promises';
import { ITable } from '../fetch/type';
import { createEmitter } from '../library/emitFile';

/** @internal */
export function generateTypescriptEnum(databaseName: string, outDir: string, tables: ITable[]) {
	const targetFile = resolve(outDir, linux_case(databaseName) + '.enums.ts');
	info('生成TypeScript文件: %s', targetFile);
	const writer = createWriteStream(targetFile);

	setImmediate(() => {
		const write = createEmitter(writer, '');

		write('// GENERATED FILE DO NOT EDIT\n\n');

		createTableName(writer, tables);
		for (const table of tables) {
			createTableField(writer, table);
		}

		writer.end();
	});

	return new Promise<void>((resolve, reject) => {
		writer.on('close', () => resolve());
		writer.on('error', reject);
	});
}

function createTableName(writer: NodeJS.WritableStream, tables: ITable[]) {
	const write = createEmitter(writer, '');

	write(`export enum DatabaseTables {`);
	for (const { name } of tables) {
		write(`\t${linux_case(name).toUpperCase()} = ${JSON.stringify(name)},`);
	}
	write('}');
}

function createTableField(writer: NodeJS.WritableStream, table: ITable) {
	const write = createEmitter(writer, '');

	write(`export enum Table${ucfirst(camelCase(table.name))}Fields {`);
	for (const { name } of table.columns) {
		write(`\t${linux_case(name).toUpperCase()} = ${JSON.stringify(name)},`);
	}
	write('}');
}
