import { decompress } from 'targz';
import { log } from './log';
import { unlinkSync } from 'fs-extra';

export async function decompressTargz(src: string, dest: string) {
	log(`Decompress files:\n    tarball: ${src}\n    dest: ${dest}`);
	await new Promise((resolve, reject) => {
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
					unlinkSync(src);
					reject(e);
				} else {
					resolve();
				}
			}
		);
	});
	log('ok.');
}
