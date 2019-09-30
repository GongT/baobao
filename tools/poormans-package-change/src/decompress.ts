import { decompress } from 'targz';
import { log } from './log';

export async function decompressTargz(src: string, dest: string) {
	log('decompressing files:');
	await new Promise((resolve, reject) => {
		decompress({
			src, dest, tar: {
				ignore(_, header) {
					return header!.name.startsWith('package/') || header!.name === 'package';
				},
				map(header) {
					header.name = header.name.replace(/^package\//, '');
					log('    %s', header.name);
					return header;
				},
			},
		}, (e) => {
			e ? reject(e) : resolve();
		});
	});
	log('ok.');
}
