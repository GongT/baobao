import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import type { LoadFnOutput, LoadHookContext, LoadHookSync } from 'node:module';
import { fileURLToPath } from 'node:url';
import { collectingFiles, verboseLines } from './collect.ts';
import { sizeOf } from './share.ts';
import { log, runPrefixFile, type NextLoad } from './types.ts';

function myLoad(url: string, context: LoadHookContext, defaultLoad: NextLoad): LoadFnOutput {
	if (url.endsWith('#generate')) {
		log.generate('execute generate "%s"', url);
		url = url.slice(0, -9);

		collectingFiles?.add(url);

		const protocolMagic = randomUUID();
		const nodeArgs = ['--import', runPrefixFile, '--experimental-transform-types', '--disable-warning=ExperimentalWarning'];
		const p = spawnSync(process.execPath, [...nodeArgs, fileURLToPath(url)], {
			stdio: ['ignore', 'pipe', 'pipe'],
			maxBuffer: 10 * 1024 * 1024,
			encoding: 'utf8',
			shell: false,
			env: {
				...process.env,
				PROTOCOL_MAGIC: protocolMagic,
			},
		});

		if (log.generate.enabled) {
			verboseLines.push(`[GENERATE] ${url}`);
			verboseLines.push(`${context.format}`);
			verboseLines.push(`conditions: [${context.conditions?.join(', ') ?? 'no conditions'}]`);
			verboseLines.push(`stdout=============================\n${p.stdout}\n=============================`);
			verboseLines.push(`stderr=============================\n${p.stderr}\n=============================`);
			verboseLines.push(``);
		}

		if (p.error) {
			log.generate(`failed to execute: error occurred: ${p.error.message}`);
			throw new Error(`process failed to start for ${url}: ${p.error.message}`);
		}
		if (p.status === 0 && !p.signal) {
			const code = `/*${JSON.stringify([process.execPath, ...nodeArgs, fileURLToPath(url)])}*/\n\n${p.stdout}`;
			log.generate(`success: ${typeof code} ${code.length} characters`);
			return {
				format: 'module',
				shortCircuit: true,
				source: Buffer.from(code, 'utf8'),
			};
		}

		log.generate(`failed to execute: status=${p.status}, signal=${p.signal}, stderr=${p.stderr}`);
		console.error(`failed to execute generater script ${url}:`);

		if (p.stderr.includes(protocolMagic)) {
			const jsonReg = new RegExp(`^${protocolMagic}\\|(.+)$`, 'gm');
			const json = jsonReg.exec(p.stderr)?.at(1);
			if (json) {
				log.generate('protocol magic found in stderr, trying to parse JSON error information');
				let data: any;
				try {
					data = JSON.parse(json);
				} catch {
					log.generate('protocol magic found but parse failed, invalid JSON data: %s', json);
				}
				if (data) {
					const e = Object.create(Error.prototype);
					const message = `exception in generater script ${url}: ${data.message}`;
					Object.assign(e, data, { message });
					Object.defineProperty(e, 'stack', {
						get() {
							return data.stack.replace(/^.+\n/, `${message}\n`);
						},
					});

					log.generate('parsed error information: %O', e);
					throw e;
				}
			} else {
				log.generate('protocol magic found but invalid');
			}
		}

		throw new Error(`failed detect what happened, stderr:\n==========================\n${p.stderr}\n==========================`);
	} else if (collectingFiles) {
		if (url.startsWith('file://')) {
			collectingFiles.add(url);
		}
	}
	return defaultLoad(url, context);
}

function wrapLoad(original: LoadHookSync): LoadHookSync {
	function addLog(specifier: string, context: LoadHookContext, r: LoadFnOutput) {
		verboseLines.push(`[LOAD   ] ${specifier}`);
		verboseLines.push(`${context.format} → ${r.format}, shortCircuit=${r.shortCircuit}, source size=${sizeOf(r.source)}`);
		verboseLines.push(`conditions: [${context.conditions?.join(', ') ?? 'no conditions'}]`);
		verboseLines.push(``);
		return r;
	}

	return (url, context, defaultLoad) => {
		if (url.startsWith('node:') || url.startsWith('data:')) {
			// 内置模块和data URL不记录日志，太多了
			return addLog(url, context, original(url, context, defaultLoad));
		}
		try {
			log.load('[EL][load] loading "%s" as %s', url, context.format);
			log.load('[EL][load]      with conditions [%s], type [%s]', context.conditions?.join(', ') ?? 'no conditions', context.importAttributes?.type);

			const r = original(url, context, (url, context) => {
				try {
					const r = defaultLoad(url, context);
					log.load('[EL][load]     success');
					return r;
				} catch (e: any) {
					log.load('[EL][load]     failed "%s" = %s', url, e.code);
					throw e;
				}
			});
			log.load('[EL][load] loaded as format [%s], shortCircuit [%s], size [%s]', r.format, r.shortCircuit, sizeOf(r.source));
			return addLog(url, context, r);
		} catch (e: any) {
			log.load('[EL][load] failed %s', e.code);
			throw e;
		}
	};
}

export const loadFunction = log.load.enabled ? wrapLoad(myLoad) : myLoad;
