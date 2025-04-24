import type esbuild from 'esbuild';
import { formatWithOptions } from 'node:util';

export const debug: Function = process.argv.includes('--debug')
	? (text: string, ...args: any[]) => {
			process.stderr.write(
				`${formatWithOptions({ colors: true, breakLength: Number.POSITIVE_INFINITY }, text, ...args)}\n`
			);
		}
	: () => {};

export function commonParent(a: string, b: string) {
	const ar = a.split(/[/\/]/g);
	const br = b.split(/[/\/]/g);
	const to = Math.min(ar.length, br.length);
	let i;
	for (i = 0; i < to; i++) {
		if (ar[i] !== br[i]) {
			break;
		}
	}

	if (i < ar.length) {
		return ar.slice(0, i).join('/');
	}
	return br.slice(0, i).join('/');
}

export interface IDiagnostics {
	errors: esbuild.PartialMessage[];
	warnings: esbuild.PartialMessage[];
}
