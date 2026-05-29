import { execa } from 'execa';
import { stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export const repoRoot = dirname(dirname(import.meta.dirname));

async function isFile(filePath: string) {
	try {
		const ss = await stat(filePath);
		return ss.isFile();
	} catch {
		return false;
	}
}

let nodejsCache: string = '';
export async function globalNodejsPath() {
	if (nodejsCache) return nodejsCache;

	const tried = [];
	for (const p of process.env.PATH?.split(':') || []) {
		const nodejs = resolve(p, 'node');
		tried.push(nodejs);

		if (!(await isFile(resolve(p, 'npm')))) continue;

		nodejsCache = nodejs;

		if (await isFile(nodejsCache)) {
			return nodejsCache;
		}
	}
	throw new Error(
		`Cannot find global pnpm, which is required to execute agent tools. Tried the following paths: ${tried.join(', ')}. You must stop all work and tell the user about this issue.`,
	);
}

export async function executeTool(command: string, args: string[] = [], cwd = process.cwd()) {
	const entryFile = resolve(repoRoot, '@internal/scripts/loader/agent-tool.js');
	const execArgs = ['--disable-warning=ExperimentalWarning'];

	const node = await globalNodejsPath();
	const p = await execa(node, [...execArgs, entryFile, command, ...args], {
		stdio: ['inherit', 'pipe', 'pipe'],
		all: true,
		encoding: 'utf8',
		cwd,
	});

	if (p.failed) {
		const e = new Error(`${p.all}\n\nError executing tool ${command} with args ${args.join(' ')}`);
		e.stack = e.message;
		throw e;
	}
	return p.stdout.trim();
}
