export type { FileBuilder, WrappedArray } from './client/file-builder.js';
export type { GenerateContext } from './client/generate-context.js';

// export async function execute(path: string) {
// 	const { default: selfPackage } = await import('../package.json', { with: { type: 'json' } });
// 	const { execFileSync } = await import('node:child_process');
// 	const { resolve } = await import('node:path');

// 	const bin = resolve(import.meta.dirname, '..', selfPackage.bin.codegen);

// 	execFileSync(bin, [path], { stdio: 'inherit' });
// }
