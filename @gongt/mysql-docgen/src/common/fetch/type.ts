/** @extern */
export interface IInformationSchemaColumnsRow {
	// TABLE_CATALOG: 'def';
	// TABLE_SCHEMA: string;
	TABLE_NAME: string;
	COLUMN_NAME: string;
	ORDINAL_POSITION: number;
	COLUMN_DEFAULT: string;
	IS_NULLABLE: string; // 'NO'
	// DATA_TYPE: string;
	// CHARACTER_MAXIMUM_LENGTH: number;
	// CHARACTER_OCTET_LENGTH: number;
	// NUMERIC_PRECISION: number;
	// NUMERIC_SCALE: number;
	// DATETIME_PRECISION: number;
	CHARACTER_SET_NAME: string; // utf8mb4 or null
	// COLLATION_NAME: number;
	COLUMN_TYPE: string;
	COLUMN_KEY: string;
	EXTRA: string;
	COLUMN_COMMENT: string;
}
/** @extern */
export interface IInformationSchemaTablesRow {
	// TABLE_CATALOG: string;
	TABLE_SCHEMA: string;
	TABLE_NAME: string;
	// TABLE_TYPE: string;
	ENGINE: string;
	// VERSION: number;
	// ROW_FORMAT: string;
	TABLE_ROWS: number;
	AVG_ROW_LENGTH: number;
	// DATA_LENGTH: number;
	// MAX_DATA_LENGTH: number;
	// INDEX_LENGTH: number;
	// DATA_FREE: number;
	AUTO_INCREMENT: number;
	CREATE_TIME: number;
	UPDATE_TIME: number;
	// CHECK_TIME: number;
	TABLE_COLLATION: string;
	// CHECKSUM: number;
	// CREATE_OPTIONS: string;
	TABLE_COMMENT: string;
	// MAX_INDEX_LENGTH: number;
	// TEMPORARY: string;
}
/** @extern */
export interface IShowIndexesRow {
	// Table: string;
	Non_unique: number;
	Key_name: string;
	Seq_in_index: number;
	Column_name: string;
	// Collation: string;
	// Cardinality: number;
	// Sub_part: any;
	// Packed: any;
	// Null: any;
	Index_type: string;
	// Comment: string;
	Index_comment: string;
}
/** @extern */
export interface ITableColumn {
	name: string;
	comment: string;
	order: number;
	defaultValue: string;
	charset: string;
	type: string;
	keyType: string;

	onUpdateCurrentTimestamp: boolean;
}
/** @extern */
export interface ITableKey {
	name: string;
	comment?: string;
	columns: string[];
	unique: boolean;
	type: string;
}
/** @extern */
export interface ITable {
	name: string;
	comment: string;

	engine: string;
	create_time: number;
	update_time: number;
	table_collation: string;

	row_count: number;
	average_row_length: number;
	current_index: number;

	columns: ITableColumn[];
	keys: ITableKey[];
}
