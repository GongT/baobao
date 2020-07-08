import { ConnectionConfig } from 'mysql';

/** @extern */
export declare interface IInformationSchemaColumnsRow {
    TABLE_NAME: string;
    COLUMN_NAME: string;
    ORDINAL_POSITION: number;
    COLUMN_DEFAULT: string;
    IS_NULLABLE: string;
    CHARACTER_SET_NAME: string;
    COLUMN_TYPE: string;
    COLUMN_KEY: string;
    EXTRA: string;
    COLUMN_COMMENT: string;
}

/** @extern */
export declare interface IInformationSchemaTablesRow {
    TABLE_SCHEMA: string;
    TABLE_NAME: string;
    ENGINE: string;
    TABLE_ROWS: number;
    AVG_ROW_LENGTH: number;
    AUTO_INCREMENT: number;
    CREATE_TIME: number;
    UPDATE_TIME: number;
    TABLE_COLLATION: string;
    TABLE_COMMENT: string;
}

/** @extern */
export declare interface IShowIndexesRow {
    Non_unique: number;
    Key_name: string;
    Seq_in_index: number;
    Column_name: string;
    Index_type: string;
    Index_comment: string;
}

/** @extern */
export declare interface ITable {
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

/** @extern */
export declare interface ITableColumn {
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
export declare interface ITableKey {
    name: string;
    comment?: string;
    columns: string[];
    unique: boolean;
    type: string;
}

/** @extern */
export declare function resolveDatabase(connection: Omit<ConnectionConfig, 'database' | 'charset'> & WithDatabase): Promise<ITable[]>;

/** @extern */
declare interface WithDatabase {
    database: string;
}

export { }
