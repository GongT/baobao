import { format } from 'util';
import { IInformationSchemaColumnsRow } from './type';
import { addDiagnosis } from '../library/diagnosis';

export interface IInformationSchemaColumnsRowRaw extends IInformationSchemaColumnsRow {
	TABLE_CATALOG: 'def';
	TABLE_SCHEMA: string;
	DATA_TYPE: string;
	CHARACTER_MAXIMUM_LENGTH: number;
	CHARACTER_OCTET_LENGTH: number;
	NUMERIC_PRECISION: number;
	NUMERIC_SCALE: number;
	DATETIME_PRECISION: number;
	COLLATION_NAME: number;
}

const sizeLint: { [id: string]: number } = {
	SMALLINT: 5,
	MEDIUMINT: 8,
	INT: 10,
	BIGINT: 19,
};

export function diagnosisColumn(colInfo: IInformationSchemaColumnsRowRaw) {
	const title = `表“${colInfo.TABLE_NAME}”中的字段“${colInfo.COLUMN_NAME}”`;

	if (/[A-Z]/.test(colInfo.COLUMN_NAME)) {
		addDiagnosis(title + '名称中包含大写字母');
	}
	if (!/^[a-z]/.test(colInfo.COLUMN_NAME)) {
		addDiagnosis(title + '首字符不是字母');
	}

	const name = colInfo.COLUMN_NAME.toLowerCase();
	const type = colInfo.DATA_TYPE.toUpperCase();
	const ctype = colInfo.COLUMN_TYPE.toUpperCase();

	if (!colInfo.COLUMN_COMMENT) {
		if (!isOptionalComment(name)) {
			addDiagnosis(title + '没有备注');
		}
	}
	if ((colInfo.IS_NULLABLE + '').toLowerCase() !== 'no') {
		addDiagnosis(title + '可为空');
	}
	if (name.endsWith('_at') || name.endsWith('_time')) {
		if (type !== 'DATETIME') {
			addDiagnosis(title + '应该使用 DATETIME 类型', correctUseDateTime(colInfo, name));
		}

		if (name === 'update_at' || name === 'update_time') {
			if (colInfo.EXTRA.toUpperCase() !== 'ON UPDATE CURRENT_TIMESTAMP()') {
				addDiagnosis(title + '没有设置“ON UPDATE CURRENT_TIMESTAMP()”', correctUseDateTime(colInfo, name));
			}
		}
	} else if (type === 'DATETIME' || type === 'TIMESTAMP') {
		addDiagnosis(title + '名称应为 xxx_at 或者 xxx_time');
	}

	if (type === 'TIMESTAMP') {
		addDiagnosis(title + '应该使用 DATETIME 类型，而不是 TIMESTAMP', correctUseDateTime(colInfo, name));
	}

	const intTypeMatch = /INT\((\d+)\)/.exec(colInfo.COLUMN_TYPE.toUpperCase());
	const intDisplaySize = intTypeMatch ? parseInt(intTypeMatch[1]) : NaN;

	if (type === 'TINYINT') {
		if (!name.startsWith('is_')) addDiagnosis(title + '名称应为 is_xxx', correctBoolField(colInfo, name));

		if (!ctype.includes('UNSIGNED')) addDiagnosis(title + '没有设置UNSIGNED', correctBoolField(colInfo, name));

		if (intDisplaySize != 1 && intDisplaySize != 4) {
			addDiagnosis(
				title + `整数类型不应设置长度（应为1或3，而不是${intDisplaySize}）`,
				correctBoolField(colInfo, name)
			);
		}
	} else if (sizeLint[type]) {
		if (name.endsWith('_id') || name === 'id') {
			// already handled
		} else {
			if (sizeLint[type] !== intDisplaySize) {
				addDiagnosis(
					title + `整数类型不应设置长度（应为${sizeLint[type]}，而不是${intDisplaySize}）`,
					correctIntField(colInfo, name)
				);
			}
		}
	}

	if (name === 'id') {
		if ((colInfo.COLUMN_KEY + '').toUpperCase() !== 'PRI') {
			addDiagnosis(title + '不是主键', correctCreatePrimary(colInfo));
		} else if (!(colInfo.EXTRA + '').includes('auto_increment')) {
			addDiagnosis(title + '不自增', correctIdField(colInfo, name));
		}
	}
	if (name === 'id' || name.endsWith('_id')) {
		if (!ctype.includes('UNSIGNED') || !ctype.startsWith('INT(10)')) {
			addDiagnosis(title + 'ID格式错误：' + ctype, correctIdField(colInfo, name));
		}
	}
}

function correctCreatePrimary(colInfo: IInformationSchemaColumnsRowRaw) {
	return format('ALTER TABLE `%s` ADD PRIMARY KEY (`id`);', colInfo.TABLE_NAME);
}

function correctBoolField(colInfo: IInformationSchemaColumnsRowRaw, name: string) {
	if (!name.startsWith('is_')) name = 'is_' + name.replace(/^_/, '');

	return format(
		'ALTER TABLE `%s` CHANGE `%s` `%s` TINYINT(1) UNSIGNED NOT NULL COMMENT %s;',
		colInfo.TABLE_NAME,
		colInfo.COLUMN_NAME,
		name,
		colInfo.COLUMN_COMMENT ? JSON.stringify(colInfo.COLUMN_COMMENT) : '"是否？？？"'
	);
}
function correctIdField(colInfo: IInformationSchemaColumnsRowRaw, name: string) {
	return format(
		'ALTER TABLE `%s` CHANGE `%s` `%s` INT UNSIGNED NOT NULL%s%s;',
		colInfo.TABLE_NAME,
		colInfo.COLUMN_NAME,
		name,
		colInfo.COLUMN_NAME.toLowerCase() === 'id' ? ' AUTO_INCREMENT' : '',
		colInfo.COLUMN_COMMENT ? ' COMMENT ' + JSON.stringify(colInfo.COLUMN_COMMENT) : ''
	);
}
function correctIntField(colInfo: IInformationSchemaColumnsRowRaw, name: string) {
	return format(
		'ALTER TABLE `%s` CHANGE `%s` `%s` %s %s NOT NULL COMMENT %s;',
		colInfo.TABLE_NAME,
		colInfo.COLUMN_NAME,
		name,
		colInfo.DATA_TYPE,
		colInfo.COLUMN_TYPE.toUpperCase().includes('UNSIGNED') ? 'UNSIGNED' : '',
		colInfo.COLUMN_COMMENT ? JSON.stringify(colInfo.COLUMN_COMMENT) : '"此处添加注释"'
	);
}
function correctUseDateTime(colInfo: IInformationSchemaColumnsRowRaw, name: string) {
	let com: string = '';
	if (colInfo.COLUMN_COMMENT) {
		com = ' COMMENT ' + JSON.stringify(colInfo.COLUMN_COMMENT);
	} else if (!isOptionalComment(name)) {
		com = ' COMMENT "此处添加注释"';
	}
	let def = '';
	if (colInfo.COLUMN_DEFAULT) {
		def = ' DEFAULT ' + colInfo.COLUMN_DEFAULT;
	}
	let ext = '';
	if (name === 'update_at' || name === 'update_time') {
		ext = ' ON UPDATE CURRENT_TIMESTAMP()';
	}
	return format(
		'ALTER TABLE `%s` CHANGE `%s` `%s` DATETIME NOT NULL %s%s%s;',
		colInfo.TABLE_NAME,
		colInfo.COLUMN_NAME,
		name,
		def,
		com,
		ext
	);
}

function isOptionalComment(name: string) {
	const isTime = ['create_time', 'create_at', 'update_time', 'update_at', 'delete_time', 'delete_at'].includes(name);
	return isTime || name.endsWith('_id') || name === 'id';
}
