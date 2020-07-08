import * as React from 'react';
import { DiagnosisList } from './element/diagnosisList';
import { ITable } from '../fetch/type';

export function createDict(tables: ITable[]): React.ReactElement {
	return (
		<React.Fragment>
			<DiagnosisList />

			<div className="p1">{tables.map(createTable)}</div>
		</React.Fragment>
	);
}

function createTable(table: ITable) {
	return (
		<div key={table.name} className="card border-dark mb-3 mr-2 d-inline-block align-top">
			<h5 className="card-header d-flex">
				<span className="flex-fill">{table.comment}</span>
				<span className="text-muted small">{table.name}</span>
			</h5>
			<div className="card-body text-dark p-0">
				<table className="table table-bordered">
					{table.columns.map((col) => (
						<tr key={col.name}>
							<th className="p-1">{col.name}</th>
							<td className="p-1 small">{col.type}</td>
							<td className="p-1">{col.comment}</td>
						</tr>
					))}
				</table>
			</div>
		</div>
	);
}
