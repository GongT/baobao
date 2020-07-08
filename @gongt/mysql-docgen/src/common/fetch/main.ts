import { diagnosisColumn } from './diagnosisColumn';
import { diagnosisLink } from './diagnosisLink';
import { diagnosisTable } from './diagnosisTable';
import {
	IInformationSchemaColumnsRow,
	IInformationSchemaTablesRow,
	IShowIndexesRow,
	ITable,
	ITableColumn,
	ITableKey,
} from './type';
import { queryApplicationSchema, queryInformationSchema } from '../mysql/connection';

async function createTableMap(dbName: string): Promise<ITable[]> {
	const result: IInformationSchemaTablesRow[] = await queryInformationSchema(
		'SELECT * FROM `TABLES` WHERE `TABLE_SCHEMA`=?',
		[dbName]
	);

	const tables = result.map((item) => {
		return {
			name: item.TABLE_NAME,
			comment: item.TABLE_COMMENT,

			engine: item.ENGINE,
			create_time: item.CREATE_TIME,
			update_time: item.UPDATE_TIME,

			row_count: item.TABLE_ROWS,
			average_row_length: item.AVG_ROW_LENGTH,
			current_index: item.AUTO_INCREMENT,

			table_collation: item.TABLE_COLLATION,

			columns: [],
			keys: [],
		};
	});

	return tables;
}

export async function resolveInformation(dbName: string) {
	const tables = await createTableMap(dbName);

	for (const table of tables) {
		const colData: IInformationSchemaColumnsRow[] = await queryInformationSchema(
			'SELECT * FROM `COLUMNS` WHERE `TABLE_SCHEMA`=? AND `TABLE_NAME`=?',
			[dbName, table.name]
		);

		table.columns = Object.values(colData).map(parseColumn);

		const keyData: IShowIndexesRow[] = await queryApplicationSchema(`SHOW INDEXES FROM ${table.name}`);

		table.keys = parseKey(keyData);

		diagnosisTable(table);
	}

	diagnosisLink(tables);

	return tables;
}

function parseColumn(colInfo: IInformationSchemaColumnsRow) {
	const onUpdateCurrentTimestamp = colInfo.EXTRA.toUpperCase() === 'ON UPDATE CURRENT_TIMESTAMP()';
	let type = colInfo.COLUMN_TYPE.toUpperCase();
	if (/INT\(\d+\)$/.test(type)) {
		type = type.split('(', 1)[0];
	}

	diagnosisColumn(colInfo as any);

	const col: ITableColumn = {
		name: colInfo.COLUMN_NAME,
		comment: colInfo.COLUMN_COMMENT,
		order: colInfo.ORDINAL_POSITION,
		defaultValue: colInfo.COLUMN_DEFAULT,
		charset: colInfo.CHARACTER_SET_NAME,
		type: type,
		keyType: (colInfo.COLUMN_KEY + '').toUpperCase(),

		onUpdateCurrentTimestamp,
	};

	return col;
}

function parseKey(keyList: IShowIndexesRow[]) {
	const map = new Map<string, ITableKey>();
	for (const obj of keyList) {
		if (!map.has(obj.Key_name)) {
			map.set(obj.Key_name, {
				name: obj.Key_name,
				comment: obj.Index_comment,
				type: obj.Index_type,
				columns: [],
				unique: obj.Non_unique == 0,
			});
		}

		const c = map.get(obj.Key_name)!.columns;
		const index = parseInt(obj.Seq_in_index as any) - 1;
		if (isNaN(index)) {
			throw new Error(`wrong index of key ${obj.Key_name}`);
		}
		if (c[index]) {
			throw new Error(`same index of key ${obj.Key_name}`);
		}
		c[index] = obj.Column_name;
	}
	return [...map.values()];
}
