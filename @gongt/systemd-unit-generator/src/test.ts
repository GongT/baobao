import { rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { inspect } from 'node:util';
import { type ISystemdServiceUnit, createSystemdUnit } from './index.js';
import { systemdAnalyzeVerify } from './tools/index.js';

const x = createSystemdUnit<ISystemdServiceUnit>();

x.Unit.After = ['a.service', 'b.target'];
x.Install.WantedBy = '666';
x.Service.ExecStart = 'aaaa';
x.Service['X-ohhhhhhhh'] = 'my god';
x['X-Note']['any-key-name'] = 'aaaa';

console.log('========= A\n%s', inspect(x, { colors: true }));
console.log('========= B\n%s', JSON.stringify(x));
console.log('========= C\n%s', x.toString());

const tmp = resolve(tmpdir(), `${(Math.random() * 10000).toFixed(0)}.service`);
process.on('exit', () => {
	rmSync(tmp);
});
writeFileSync(tmp, x.toString());
const r = await systemdAnalyzeVerify(tmp);
console.log('========= D\n%s', r);
