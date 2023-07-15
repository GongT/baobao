import { posix, resolve } from 'path';
import { error, info } from 'fancy-log';
import { mkdirp } from 'fs/promises';
import { ConnectionConfig } from 'mysql';
import { resolveInformation } from './common/fetch/main';
import { generateDocuments } from './common/generate/main';
import { generateTypescriptDTS } from './common/generate.typescript/tsmain';
import { generateTypescriptEnum } from './common/generate.typescript/tsenum';
import { argParse } from './common/library/argParse';
import { die, usage } from './common/library/base';
import { NormalError } from './common/library/normalError';
import { readPassword } from './common/library/readPassword';
import { mysqlConnect, mysqlDisconnect } from './common/mysql/connection';
import { getDefaultArgs } from './common/mysql/runNativeCommand';

const flags = {
	host: {
		short: 'h',
		param: true,
		missing: () => 'localhost',
	},
	port: {
		short: 'P',
		param: false,
		missing: () => '3306',
		parse: parseInt,
	},
	socket: {
		short: 'S',
		param: true,
		missing: () => undefined,
	},
	user: {
		short: 'u',
		param: true,
		missing: () => process.env.USER || 'root',
	},
	password: {
		short: 'p',
		param: false,
		missing: () => undefined,
		async parse(v: any) {
			if (v === true) {
				return readPassword();
			}
			return v || undefined;
		},
	},
	'output-dir': {
		short: 'O',
		param: true,
		missing: () => process.cwd() + '/docs/mysql-collections',
		parse: posix.resolve,
	},
	'connect-timeout': {
		param: true,
		missing: () => undefined,
		parse: parseInt,
	},
	'secure-auth': {
		param: false,
		parse: (v: string) => !!v,
	},
};

async function getDefault() {
	const mysqlcmd = await getDefaultArgs();
	const ret = await argParse(mysqlcmd, flags);
	// console.log(mysqlcmd, ret);
	const { host, port, socket, user, password } = ret;
	return { host, port, socketPath: socket, user, password };
}

(async () => {
	const argv = process.argv.slice(2);

	if (argv.includes('--help') || argv.includes('--usage')) {
		return usage();
	}

	const opts = await argParse(argv, flags);
	if (argv.length < 1) {
		die('database name is required.');
	} else if (argv.length > 1) {
		die('Unknown param: ' + argv.join(', '));
	} else if (argv[0].startsWith('-')) {
		die('database name is required.');
	}
	const db = argv.pop()!;

	const cfg: ConnectionConfig = await getDefault();

	if (opts.host) cfg.host = opts.host;
	if (opts.port) cfg.port = opts.port;
	if (opts.socket) cfg.socketPath = opts.socket;
	if (opts.user) cfg.user = opts.user;
	if (opts.password) cfg.password = opts.password;

	const target = resolve(process.cwd(), opts['output-dir']);
	await mkdirp(target);

	process.once('beforeExit', () => {
		mysqlDisconnect().finally(() => process.exit(0));
	});
	await mysqlConnect(db, cfg);
	const data = await resolveInformation(db);
	info('信息收集成功');

	await generateDocuments(target, data);
	await generateTypescriptDTS(db, target, data);
	await generateTypescriptEnum(db, target, data);
})()
	.then(
		() => {
			info('Done.');
			process.exit(0);
		},
		(e) => {
			if (e instanceof NormalError) {
				error(e.message);
			} else {
				error(e.stack);
			}
			process.exit(1);
		}
	)
	.finally(() => {
		return mysqlDisconnect();
	});
