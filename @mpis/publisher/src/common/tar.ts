import { extract } from 'tar/extract';

export async function decompressTarGz(sourceTgz: string, outDir: string): Promise<void> {
	await extract({ gzip: true, file: sourceTgz, cwd: outDir });
}
