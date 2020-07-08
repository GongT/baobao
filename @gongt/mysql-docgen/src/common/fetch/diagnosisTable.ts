import { ITable } from './type';
import { addDiagnosis } from '../library/diagnosis';

export function diagnosisTable(table: ITable) {
	const title = `表“${table.name}”`;

	if (/[A-Z]/.test(table.name)) {
		addDiagnosis(title + '名称中包含大写字母');
	}
	if (!/^[a-z]/.test(table.name)) {
		addDiagnosis(title + '首字符不是字母');
	}

	// const name = table.name.toLowerCase();

	if (!table.comment) {
		addDiagnosis(title + '没有添加备注');
	}
	if (table.engine.toLowerCase() !== 'innodb') {
		addDiagnosis(title + '使用了错误的存储引擎（应为InnoDB）');
	}

	if (!table.table_collation.toLowerCase().startsWith('utf8mb4')) {
		addDiagnosis(title + '使用了错误的字符集（应为“utf8mb4_”系列）');
	}

	const hasPrimary = table.columns.some((item) => item.keyType === 'PRI');
	if (!hasPrimary) {
		addDiagnosis(title + '不存在主键');
	}
}
