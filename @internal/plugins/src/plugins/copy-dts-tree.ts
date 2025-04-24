import type { HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession } from '@rushstack/heft';

import { link, readlink, stat, symlink, unlink } from 'node:fs/promises';
import { glob } from 'glob';
import { resolve } from 'node:path';

export const PLUGIN_NAME = 'copy-dts-tree';

interface IOptions {
	readonly from: string;
	readonly to: string;
}

export default class CopyDtsTreePlugin implements IHeftTaskPlugin<IOptions> {
	apply(session: IHeftTaskSession, configuration: HeftConfiguration, options: IOptions): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, async (_opt) => {
			const statistics = { same: 0, add: 0, remove: 0 };
			session.logger.terminal.writeLine(`Copy dts files from ${options.from} to ${options.to}`);

			const source = resolve(configuration.buildFolderPath, options.from);
			const target = resolve(configuration.buildFolderPath, options.to);

			const output = await glob('**/*.d.ts', { cwd: source });
			const current = new Set(await glob('**/*.d.ts', { cwd: target }));

			for (const file of output) {
				current.delete(file);

				const f = resolve(options.from, file);
				const t = resolve(options.to, file.replace(/\.ts$/, '.cts'));

				if (await isSameFile(f, t)) {
					statistics.same++;
					continue;
				}

				try {
					await makeHardLink(f, t);
				} catch {
					session.logger.terminal.writeVerboseLine(`Copying ${f} to ${t}`);
					await ensureLink(f, t);
				}
				statistics.add++;
			}

			for (const orphan of current) {
				const d = resolve(target, orphan);
				session.logger.terminal.writeVerboseLine(`Removing orphaned file ${d}`);
				await unlink(d);
				statistics.remove++;
			}

			session.logger.terminal.writeLine(
				`Copied ${statistics.add}, removed ${statistics.remove}, skipped ${statistics.same}.`
			);
		});
	}
}

async function ensureLink(file: string, sym: string) {
	try {
		const curr = await readlink(sym);
		if (curr === file) {
			return;
		}
		await unlink(sym);
	} catch {}
	await symlink(file, sym);
}

async function isSameFile(a: string, b: string) {
	try {
		const sa = await stat(a);
		const sb = await stat(b);
		return sa.ino === sb.ino && sa.size === sb.size && sa.mtimeMs === sb.mtimeMs;
	} catch {
		return false;
	}
}

async function makeHardLink(a: string, b: string) {
	try {
		await unlink(b);
	} catch {}
	await link(a, b);
}
