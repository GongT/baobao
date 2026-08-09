import { app, logger as rootLogger } from '@idlebox/cli';
import { CanceledError, convertCaughtError, prettyPrintError } from '@idlebox/common';
import { printLine } from '@idlebox/node';
import { setInterval, setTimeout } from 'node:timers/promises';
import { self_package_name, userAgent } from '../version.generated.js';

const logger = rootLogger.extend('cnpm');

interface Options {
	readonly printLog?: boolean;
	readonly dryRun?: boolean;
	readonly wait?: boolean;
	readonly tip: string;
}

export async function cnpmSyncNames(pkgs: Record<string, string>, { printLog = app.verbose, dryRun = false, wait = true, tip }: Options) {
	const log = printLog || dryRun ? logger.log : logger.verbose;
	if (dryRun) {
		log`[dry-run] 🔃 cnpm同步${Object.keys(pkgs).length}个包:`;
		for (const [name, version] of Object.entries(pkgs)) {
			log`[dry-run]   - ${name}@${version}`;
		}
		return;
	}

	const ps: PromiseLike<SyncResult | SyncFullResult>[] = [];
	for (const [name, version] of Object.entries(pkgs)) {
		const p = cnpmSync(name, { version, tip });
		ps.push(wait ? p.wait() : p);
	}

	try {
		const result = await Promise.allSettled(ps);
		log`    ✨ cnpm同步${wait ? '执行' : '请求'}完成`;
		for (const [i, r] of result.entries()) {
			const [name, version] = Object.entries(pkgs)[i];
			if (r.status === 'rejected') {
				log`    ⚠️ 异常: ${name}@${version}`;
			} else if (printLog) {
				printLine();
				log`    ✅ 成功: ${name}@${version}`;

				if (wait) {
					const fullResult = r.value as SyncFullResult;
					fullResult.log.split('\n').forEach((line) => {
						log(line);
					});
				}
			}
		}
	} catch (e) {
		if (printLog) {
			printLine();
			prettyPrintError('cnpm同步请求失败', convertCaughtError(e));
		}
		throw e;
	}
}

enum ErrorKind {
	HTTP,
}

export class CNpmSyncError extends Error {
	/**
	 * 传输错误
	 */
	public readonly isHttp: boolean;
	/**
	 * 服务器返回success=false的响应
	 * 此时response中包含服务器返回的json（否则response为undefined）
	 */
	public readonly denied: boolean;
	public readonly response: any;

	constructor(
		message: string,
		public readonly syncId: string,
		public readonly packageName: string,
		cause: any,
		kind: ErrorKind | any,
	) {
		super(`cnpm同步失败 ${packageName}: ${message}`, { cause });
		this.denied = false;
		this.isHttp = false;

		if (kind === ErrorKind.HTTP) {
			this.isHttp = true;
		} else {
			this.denied = true;
			this.response = kind as any;
		}
	}

	async log() {
		if (this.response?.log) return this.response.log as string;
		if (this.syncId) {
			return getSyncLog(this.packageName, this.syncId);
		}
		throw new Error(`同步未进行，无法获取日志`);
	}
}

interface SingleOptions {
	readonly tip: string;
	readonly version?: string;
}
enum TaskState {
	waiting = 'waiting', // Task is queued
	processing = 'processing', // Task is currently running
	success = 'success', // Task completed successfully
	error = 'error', // Task failed
}
type putJobResp = { ok: boolean; id: string; type: string; state: TaskState };

interface PromiseWithMethod extends Promise<SyncResult> {
	wait(): Promise<SyncFullResult>;
	log(): Promise<string>;
}
export function cnpmSync(name: string, opts: SingleOptions): PromiseWithMethod {
	const p = cnpmSyncImpl(name, opts);

	return Object.assign(p, {
		wait: async () => {
			const r = await p;
			return r.wait();
		},
		log: async () => {
			const r = await p;
			return r.fetchLog();
		},
	}) as any;
}

async function cnpmSyncImpl(name: string, { version, tip }: SingleOptions): Promise<SyncResult> {
	// https://github.com/cnpm/cnpmcore/blob/master/docs/internal-api.md#package-sync-api
	const putJobUrl = `https://registry.npmmirror.com/-/package/${name}/syncs`;

	logger.verbose`[fetch] PUT ${putJobUrl}`;
	const res = await fetch(putJobUrl, {
		method: 'PUT',
		body: JSON.stringify({
			tips: `由于${tip}，由${self_package_name}发起同步`,
			skipDependencies: true,
			syncDownloadData: false,
			specificVersions: version ? JSON.stringify([version]) : undefined,
		}),
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'User-Agent': userAgent,
		},
	}).catch((e) => {
		throw new CNpmSyncError('无法发起同步请求', '', name, e, ErrorKind.HTTP);
	});

	let id: string;
	const text = await res.text().catch((e) => {
		throw new CNpmSyncError('响应异常', '', name, e, ErrorKind.HTTP);
	});

	try {
		const body: putJobResp = JSON.parse(text);
		if (!body.ok) {
			throw new CNpmSyncError(`同步请求被拒绝`, '', name, undefined, body);
		}
		id = body.id;
	} catch (e) {
		throw new CNpmSyncError(`无法解析json: (${res.status}) ${text}`, '', name, e, ErrorKind.HTTP);
	}

	return new SyncResult(name, id);
}

interface SyncFullResult {
	readonly syncId: string;
	readonly log: string;
}

async function getSyncLog(name: string, syncId: string): Promise<string> {
	const logUrl = `https://registry.npmmirror.com/-/package/${name}/syncs/${syncId}/log`;
	logger.verbose`[fetch] GET ${logUrl}`;
	const response = await fetch(logUrl, {
		method: 'GET',
		headers: {
			'User-Agent': userAgent,
		},
	}).catch((e) => {
		throw new CNpmSyncError('无法获取日志', syncId, name, e, ErrorKind.HTTP);
	});
	return await response.text().catch((e) => {
		throw new CNpmSyncError('响应异常', '', name, e, ErrorKind.HTTP);
	});
}

class SyncResult {
	private waitedPromise: Promise<SyncFullResult> | undefined;
	public readonly statusUrl: string;

	constructor(
		public readonly packageName: string,
		public readonly syncId: string,
	) {
		this.statusUrl = `https://registry.npmmirror.com/-/package/${packageName}/syncs/${syncId}`;
	}

	get logUrl(): string {
		return `${this.statusUrl}/log`;
	}

	private async check(signal?: AbortSignal) {
		logger.verbose`[fetch] GET ${this.statusUrl}`;
		const res = await fetch(this.statusUrl, {
			method: 'GET',
			headers: {
				'User-Agent': userAgent,
			},
			signal: signal,
		}).catch((e) => {
			throw new CNpmSyncError('无法获取同步状态', this.syncId, this.packageName, e, ErrorKind.HTTP);
		});

		const text = await res.text().catch((e) => {
			throw new CNpmSyncError('响应异常', this.syncId, this.packageName, e, ErrorKind.HTTP);
		});

		try {
			const body: putJobResp = JSON.parse(text);
			if (body.state === TaskState.waiting) {
				return undefined;
			}
			return body;
		} catch (e) {
			throw new CNpmSyncError(`无法解析json: (${res.status}) ${text}`, this.syncId, this.packageName, e, ErrorKind.HTTP);
		}
	}

	private async __wait(signal?: AbortSignal) {
		let r;
		for (const to of [1000, 2000, 3500]) {
			await setTimeout(to, null, { signal });
			if ((r ??= await this.check(signal))) {
				return r;
			}
		}
		for await (const _ of setInterval(5000, null, { signal })) {
			if ((r ??= await this.check(signal))) {
				return r;
			}
		}
		throw new CanceledError();
	}

	private declare log: string;
	async _wait(signal?: AbortSignal): Promise<SyncFullResult> {
		const resp = await this.__wait(signal);
		logger.debug`等到同步结果: ${resp}`;
		this.log = await this.fetchLog();

		if (resp.state === TaskState.error) {
			throw new CNpmSyncError(`同步失败`, this.syncId, this.packageName, undefined, {
				...resp,
				log: this.log,
			});
		}

		return this as any;
	}

	/**
	 * 获取同步日志，无缓存
	 */
	fetchLog() {
		return getSyncLog(this.packageName, this.syncId);
	}

	/**
	 * 等待同步完成，返回最终结果
	 */
	async wait(signal?: AbortSignal) {
		return (this.waitedPromise ??= this._wait(signal));
	}
}
