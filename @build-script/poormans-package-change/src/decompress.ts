import { decompress } from 'targz';
import { log } from './log';
import { unlinkSync } from 'fs-extra';

export async function decompressTargz(src: string, dest: string) {
	log('decompressing files:');
	await new Promise((resolve, reject) => {
		decompress(
			{
				src,
				dest,
				tar: {
					ignore(_, header) {
						return header!.name.startsWith('package/') || header!.name === 'package';
					},
					map(header) {
						header.name = header.name.replace(/^package\//, '');
						log('    %s', header.name);
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
