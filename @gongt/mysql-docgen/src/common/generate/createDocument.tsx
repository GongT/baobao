import * as React from 'react';
import { DiagnosisList } from './element/diagnosisList';
import { ITable, ITableColumn, ITableKey } from '../fetch/type';

function LinkTo(props: React.PropsWithChildren<{ comment: string; name: string; [id: string]: any }>) {
	return (
		<a
			data-toggle="pill"
			data-name={props.name}
			data-title={props.comment}
			href={'#tbl-' + props.name}
			role="tab"
			aria-controls={'tbl-' + props.name}
			{...props}
		>
			{props.children}
		</a>
	);
}

function link(table: ITable, index: number) {
	return (
		<li key={table.name} className="nav-item">
			<LinkTo
				comment={table.comment}
				id={table.name + '-tab'}
				className={`nav-link${index === 0 ? ' active' : ''}`}
				name={table.name}
				aria-selected={index === 0}
			>
				{table.comment}
			</LinkTo>
		</li>
	);
}

function pad(v: number) {
	return v > 9 ? v.toFixed(0) : '0' + v.toFixed(0);
}
function formatDate(v: any) {
	if (!v) return '从不';
	const d = new Date(v);

	return (
		<span title={v}>
			{d.getFullYear()}/{pad(d.getMonth() + 1)}/{pad(d.getDate())} {pad(d.getHours())}:{pad(d.getMinutes())}:
			{pad(d.getSeconds())}
		</span>
	);
}
function body(table: ITable, index: number) {
	return (
		<div
			id={'tbl-' + table.name}
			role="tabpanel"
			aria-labelledby={table.name + '-tab'}
			key={table.name}
			className={index === 0 ? 'tab-pane active' : 'tab-pane'}
		>
			<div className="card">
				<h5 className="card-header">{table.comment}</h5>
				<div className="card-body">
					<h5 className="card-title d-flex">
						<span className="flex-fill">信息</span>
						<span className="small text-muted">截止到{formatDate(new Date())}</span>
					</h5>
					<div className="card-text">
						<table className="table">
							<tr>
								<th className="text-right">表名：</th>
								<td>{table.name}</td>
								<th className="text-right">创建于：</th>
								<td>{formatDate(table.create_time)}</td>
							</tr>
							<tr>
								<th className="text-right">存取引擎：</th>
								<td>{table.engine}</td>
								<th className="text-right">上次修改：</th>
								<td>{formatDate(table.update_time)}</td>
							</tr>
							<tr>
								<th className="text-right">字符集：</th>
								<td>{table.table_collation}</td>
								<th className="text-right">行数：</th>
								<td>~{table.row_count}</td>
							</tr>
							<tr>
								<th className="text-right">平均行长度：</th>
								<td>{table.average_row_length}</td>
								<th className="text-right">当前自增值：</th>
								<td>{table.current_index}</td>
							</tr>
						</table>
					</div>
					<h5 className="card-title">字段列表</h5>
					<div className="card-text">
						<table className="table table-hover">
							<thead>
								<tr>
									<th>#</th>
									<th>名称</th>
									<th>备注</th>
									<th>字符集</th>
									<th>类型</th>
									<th>其他</th>
								</tr>
							</thead>
							<tbody>{table.columns.sort((a, b) => a.order - b.order).map(createFieldList)}</tbody>
						</table>
					</div>
					<h5 className="card-title">索引</h5>
					<div className="card-text">
						<table className="table table-hover">
							<thead>
								<tr>
									<th>ID</th>
									<th>注释</th>
									<th>字段</th>
									<th>类型</th>
									<th>唯一</th>
								</tr>
							</thead>
							<tbody>{table.keys.map(createKeyList)}</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
function createFieldList(col: ITableColumn) {
	return (
		<tr key={col.name}>
			<th>{col.order}</th>
			<td>
				{col.name.endsWith('_id') ? (
					<span
						className="badge badge-light"
						style={{
							fontSize: '100%',
							fontWeight: 'normal',
						}}
					>
						🔗{col.name.replace(/_id$/, '')}
					</span>
				) : (
					col.name
				)}
			</td>
			<td>{col.comment}</td>
			<td>{col.charset}</td>
			<td>{col.type}</td>
			<td>
				{col.defaultValue ? (
					<span className={'badge badge-' + (col.type.startsWith('DATETIME') ? 'success' : 'danger')}>
						默认值
					</span>
				) : null}
				{col.keyType ? <span className="badge badge-primary">🔑{col.keyType}</span> : null}
				{col.onUpdateCurrentTimestamp ? <span className="badge badge-light">更新时间</span> : null}
			</td>
		</tr>
	);
}
function createKeyList(key: ITableKey) {
	return (
		<tr key={key.name}>
			<td>{key.name}</td>
			<td>{key.comment}</td>
			<td>
				{key.columns.map((s) => (
					<span key={s} className="badge badge-primary">
						{s}
					</span>
				))}
			</td>
			<td>{parseType(key.type)}</td>
			<td>{key.unique ? '✔' : ''}</td>
		</tr>
	);
}

const isInt = /INT\(\d+\)/;

function parseType(t: string) {
	if (isInt.test(t)) {
		return t.replace(/\(\d+\)/, '');
	}
	return t;
}

declare const $: any;
function findingCurrent() {
	if (location.hash.startsWith('#')) {
		const id = location.hash.replace(/^#/, '');
		console.log('switch page', id);
		$('#' + id + '-tab').click();
	}

	$(document).on('shown.bs.tab', (event: MouseEvent) => {
		console.log(event.target);
		const name = $(event.target).data('name');
		location.hash = name;
	});
}

export function createDocument(tables: ITable[]): React.ReactElement {
	return (
		<React.Fragment>
			<DiagnosisList />
			<script dangerouslySetInnerHTML={{ __html: '$(' + findingCurrent.toString() + ');' }}></script>
			<div className="p-2 d-flex flex-row">
				<div className="text-right text-truncate mr-1" style={{ minWidth: '10em', maxWidth: '20em' }}>
					<ul
						className="nav flex-column nav-pills"
						id="v-pills-tab"
						role="tablist"
						aria-orientation="vertical"
					>
						{tables.map(link)}
					</ul>
				</div>

				<div className="flex-fill tab-content">{tables.map(body)}</div>
			</div>
		</React.Fragment>
	);
}
