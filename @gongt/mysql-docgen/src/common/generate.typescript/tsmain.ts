import { resolve } from 'path';
import { camelCase, ucfirst, linux_case } from '@idlebox/common';
import { info } from 'fancy-log';
import { createWriteStream } from 'fs/promises';
import { ITable } from '../fetch/type';
import { createEmitter } from '../library/emitFile';

/** @internal */
export function generateTypescriptDTS(databaseName: string, outDir: string, tables: ITable[]) {
	const targetFile = resolve(outDir, linux_case(databaseName) + '.d.ts');
	info('生成TypeScript文件: %s', targetFile);
	const writer = createWriteStream(targetFile);

	setImmediate(() => {
		const write = createEmitter(writer, '');

		write('// GENERATED FILE DO NOT EDIT\n\n');
		write(`declare namespace Mysql${ucfirst(camelCase(databaseName))}Database {\n\n`);

		for (const table of tables) {
			createTableFile(writer, table);
		}
		write(`}\n`);

		writer.end();
	});

	return new Promise<void>((resolve, reject) => {
		writer.on('close', () => resolve());
		writer.on('error', reject);
	});
}

function createTableFile(writer: NodeJS.WritableStream, table: ITable) {
	const write = createEmitter(writer, '\t');
	const write2 = createEmitter(writer, '\t\t');

	write(`/** ${commentLines(table.comment)}`);
	write(` * @表名 ${table.name}`);
	write(` * @字符集 ${table.table_collation}`);
	write(' */');
	write(`export interface I${ucfirst(camelCase(table.name))} {`);

	for (const field of table.columns) {
		write2(`/** ${commentLines(field.comment)}`);
		write2(` * @默认值 ${field.defaultValue}`);
		if (field.keyType) write2(` * @键 ${field.keyType}`);
		write2(' */');
		write2(`${field.name}: ${mapType(field.type)}; // ${field.type}`);
	}

	write('}');
}

function commentLines(c: string) {
	return c
		.trim()
		.split(/\s*[\n|\r]+\s*/g)
		.concat([''])
		.join('\n * ');
}

function mapType(type: string) {
	let T = type.split(' ', 1)[0];
	T = T.replace(/\(\d+\)$/, '');

	if (type.startsWith('JSON')) {
		return 'any';
	}
	if (type.startsWith('TINYINT(1)')) {
		return 'boolean';
	}

	switch (T.toUpperCase()) {
		/* YEAR as number */
		case 'YEAR':

		/* native number */
		case 'TINYINT':
		case 'SMALLINT':
		case 'INT':
		case 'MEDIUMINT':
		case 'FLOAT':
		case 'DOUBLE':
			return 'number';

		/* return as string */
		case 'BIGINT':
		case 'DECIMAL':
		case 'TIME':
		case 'GEOMETRY':

		/* native string */
		case 'CHAR':
		case 'VARCHAR':
		case 'TINYTEXT':
		case 'TEXT':
		case 'MEDIUMTEXT':
		case 'LONGTEXT':
		case 'ENUM':
		case 'SET':
			return 'string';

		case 'BINARY':
		case 'VARBINARY':
		case 'TINYBLOB':
		case 'BLOB':
		case 'MEDIUMBLOB':
		case 'LONGBLOB':
		case 'BIT':
			return 'Buffer';

		/* time */
		case 'DATE':
		case 'DATETIME':
		case 'TIMESTAMP':
			return 'Date';

		/* json */
		case 'JSON':
			return 'any';

		/* extend */
		case 'BOOLEAN':
		case 'BOOL':
			return 'boolean';

		/* special */
		case 'POINT':
		case 'LINESTRING':
		case 'POLYGON':
		case 'GEOMETRYCOLLECTION':
		case 'MULTILINESTRING':
		case 'MULTIPOINT':
		case 'MULTIPOLYGON':
			return 'object /* TODO */';
	}

	return 'unknown';
}
