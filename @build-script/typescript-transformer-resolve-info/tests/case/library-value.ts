import fs, { writeFile as writeFileAsync, WriteOptions } from 'fs-extra';

export let testA: WriteOptions | null;
writeFileAsync('/tmp/xxx', 'test');
fs.readFileSync('');
