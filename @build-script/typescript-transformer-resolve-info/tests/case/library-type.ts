import fs, { writeFile as writeFileAsync, Stats } from 'fs-extra';

export let testA: typeof writeFileAsync = null as any;
export let testB: fs.WriteOptions = null as any;
export type testC = Pick<fs.Stats, 'atime'>;

export function fake(fs: string): [string, Stats] {
	console.log(fs);
	return 0 as any;
}
