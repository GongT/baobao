import debug from 'debug';
import assert from 'node:assert';
import { unlinkSync } from 'node:fs';
import { createConnection, createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const log = debug('executer:e:lock');
globalThis.ImHoldingLock = false;

export async function exclusiveLock() {
	if (globalThis.ImHoldingLock) return () => Promise.resolve();

	const lockFile = lockFilePath();

	let server;
	const server_handle = () => {
		log(`有客户端连接!`);
	};

	log(`锁文件: ${lockFile}`);
	while (true) {
		log(`尝试锁定...`);
		if (server) {
			server.close();
		}

		server = createServer(server_handle);
		const ok = await tryListen(lockFile, server);
		if (ok) {
			log(`已获得锁! 继续程序……`);
			break;
		}

		if (await detectStale(lockFile)) {
			continue; // 锁文件已被删除，立即重试
		}

		log(`锁定失败，等待 1 秒后重试...`);
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	server.unref();

	globalThis.ImHoldingLock = true;

	const close = async () => {
		log(`释放锁`);
		globalThis.ImHoldingLock = false;
		await new Promise((resolve) => {
			server.close((e) => {
				if (!e) {
					try {
						unlinkSync(lockFile);
					} catch (e) {
						if (e.code !== 'ENOENT') {
							log(`删除锁文件失败: ${e}`);
						}
					}
				}
				resolve();
			});
		});
	};

	return close;
}

async function detectStale(lockFile) {
	const { promise, resolve, reject } = Promise.withResolvers();
	const socket = createConnection(lockFile, () => {
		log(`锁文件存在且有效`);
		resolve(false);
	});

	socket.on('error', (err) => {
		if (err.code === 'ECONNREFUSED') {
			log(`锁文件存在但无效`);
			resolve(true);
		} else {
			reject(err);
		}
	});

	const stale = await promise;

	if (stale) {
		unlinkSync(lockFile);
		log(`锁文件已删除`);
	}

	socket.removeAllListeners();
	socket.destroy();

	return stale;
}

async function tryListen(lockFile, server) {
	const { promise, resolve, reject } = Promise.withResolvers();

	const handle = (err) => {
		if (err.code === 'EADDRINUSE') {
			resolve(false);
		} else {
			reject(err);
		}
	};

	server.once('error', handle);
	server.listen(lockFile, () => {
		server.removeListener('error', handle);
		log(`锁定成功`);
		resolve(true);
	});

	return await promise;
}

function lockFilePath() {
	if (process.env.CI) {
		assert.ok(process.env.RUNNER_TEMP, '缺少环境: RUNNER_TEMP');
		return resolve(process.env.RUNNER_TEMP, 'native-executer-build.lock');
	} else if (process.platform === 'win32') {
		return `//./pipe/idlebox/native-executer-build.lock`;
	} else {
		const tmp = process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || tmpdir() || '/tmp';
		return resolve(tmp, 'native-executer-build.lock');
	}
}
