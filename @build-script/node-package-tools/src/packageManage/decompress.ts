import { convertCatchedError } from '@idlebox/common';
import { unlinkSync } from 'fs';
import { decompress } from 'targz';
import { debug, log } from '../inc/log';

export async function decompressTargz(src: string, dest: string) {
	log(`Decompress files:`);
	debug(`    file: ${src}\n    dir: ${dest}`);
	await new Promise<void>((resolve, reject) => {
		decompress(
			{
				src,
				dest,
				tar: {
					ignore(_, header) {
						return !header || !header.name;
					},
					map(header) {
						if (header.name.startsWith('package/')) {
							header.name = header.name.replace(/^package\//, '');
						} else {
							header.name = '';
						}
						return header;
					},
				},
			},
			(e) => {
				if (e) {
					console.error(convertCatchedError(e).stack);
					unlinkSync(src);
					reject(e);
				} else {
					resolve();
				}
			},
		);
	});
	log('ok.');
}
