import { info } from 'fancy-log';
import { Connection, ConnectionConfig, createConnection } from 'mysql';
import { inspect, promisify } from 'util';
import { NormalError } from '../library/normalError';

interface PromiseQueryFunction {
	(sql: string, args?: any[]): Promise<any[]>;
}

let connInformationSchema: Connection;
let connApplication: Connection;
export let queryInformationSchema: PromiseQueryFunction = undefined as any;
export let queryApplicationSchema: PromiseQueryFunction = undefined as any;

export async function mysqlDisconnect() {
	if (connInformationSchema) {
		queryInformationSchema = undefined as any;
		queryApplicationSchema = undefined as any;
		await Promise.all([
			promisify(connInformationSchema.end.bind(connInformationSchema)),
			promisify(connApplication.end.bind(connApplication)),
		]);
		connInformationSchema = null as any;
		connApplication = null as any;
	} else {
		return Promise.resolve();
	}
}

export function mysqlConnect(database: string, config: Omit<ConnectionConfig, 'database' | 'charset'>) {
	info('连接数据库，参数：%s', inspect(config, { colors: process.stderr.isTTY }));

	if (connInformationSchema) throw new Error('???');

	connInformationSchema = createConnection({
		...config,
		database: 'information_schema',
		charset: 'utf8mb4_bin',
	});
	connApplication = createConnection({
		...config,
		database,
		charset: 'utf8mb4_bin',
	});

	return Promise.all([
		promisify(connInformationSchema.connect.bind(connInformationSchema))(),
		promisify(connApplication.connect.bind(connApplication))(),
	]).then(
		() => {
			info('MySQL服务器连接成功');
			queryInformationSchema = queryFactory(connInformationSchema);
			queryApplicationSchema = queryFactory(connApplication);
		},
		(error) => {
			throw new NormalError(error.message);
		}
	);
}

function queryFactory(conn: Connection): PromiseQueryFunction {
	return (sql: string, args?: any[]) => {
		return new Promise((resolve, reject) => {
			info('[SQL]%s', conn.format(sql, args || []));
			conn.query(sql, args, (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	};
}
