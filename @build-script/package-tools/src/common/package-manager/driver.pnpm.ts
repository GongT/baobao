import { execLazyError, exists } from '@idlebox/node';
import { resolve } from 'node:path';
import { isVerbose } from '../functions/cli.js';
import { PackageManager } from './driver.abstract.js';

interface IPnpmPublishResult {
	id: string;
	name: string;
	version: string;
	size: number;
	unpackedSize: number;
	shasum: string; // 'e320229fe019545b8e384ff19961de18d83c2673';
	integrity: string; // 'sha512-0HwCZquIeAlDPVBfb9FEpvD+fzRaw+t7+K9L4cUKFi0l2NbClu/YnmBt9rJy/pdkkfcnuB1CS7lBfsUN6AwVCA==';
	filename: string; // 'idlebox-common-1.4.2.tgz';
	files: {
		path: string;
		size: number;
		mode: number;
	}[];
	entryCount: number;
	bundled: []; // ?
}

export class PNPM extends PackageManager {
	override binary = 'pnpm';

	override async _pack(saveAs: string, packagePath: string) {
		const chProcess = await execLazyError(this.binary, ['pack', '--pack-destination', saveAs], {
			cwd: packagePath,
			verbose: isVerbose,
			env: { LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' },
		});
		const lastLine = chProcess.stdout.trim().split('\n').pop();
		if (!lastLine) {
			throw new Error('impossible: string split empty?');
		}
		const output = resolve(packagePath, lastLine);

		if (await exists(output)) {
			return output;
		}

		throw new Error(`pnpm pack失败: ${output} 不存在`);
	}

	override async _uploadTarball(pack: string, cwd: string) {
		let result: IPnpmPublishResult;
		try {
			const output = await this._execGetOut(cwd, ['publish', pack, '--json', '--no-git-checks']);
			result = JSON.parse(output);
		} catch (e: any) {
			if (e.stderr?.includes('You cannot publish over the previously published versions')) {
				return;
			}
			throw e;
		}

		return {
			name: result.name,
			version: result.version,
		};
	}
}
