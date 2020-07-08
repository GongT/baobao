import { ITable } from './type';
import { addDiagnosis } from '../library/diagnosis';

export function diagnosisLink(tables: ITable[]) {
	const knownTables = tables.map((table) => table.name);

	knownTables.push('parent', 'child');

	for (const table of tables) {
		for (const column of table.columns) {
			if (column.name.endsWith('_id')) {
				const linkTo = column.name.replace(/_id$/, '');
				if (!knownTables.includes(linkTo)) {
					addDiagnosis(`表“${table.name}”中的“${column.name}”字段连接目标“${linkTo}”不存在`, '', true);
				}
			}
		}
	}
}
