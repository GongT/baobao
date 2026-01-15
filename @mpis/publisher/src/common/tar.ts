import { extract } from 'tar/extract';

export async function decompressTarGz(sourceTgz: string, outDir: string, strip = 1): Promise<void> {
	await extract({ gzip: true, file: sourceTgz, cwd: outDir, stripComponents: strip });
}
