import fs, { writeFile as writeFileAsync, WriteOptions } from 'fs-extra';

export let testA: WriteOptions | null;
writeFileAsync('/tmp/xxx', 'test');

export function fake(f: typeof fs) {
	f.access('/tmp/xxx', () => {});
}
