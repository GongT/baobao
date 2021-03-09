import { createMaster, NodeIPCMain } from '../../..';
import { fork } from 'child_process';
import { resolve } from 'path';
import { Transform } from 'stream';

const cp1 = fork(resolve(__dirname, 'child.cjs'), ['1'], { stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
const cp2 = fork(resolve(__dirname, 'child.cjs'), ['2'], { stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
const child1 = new NodeIPCMain('child1', cp1);
const child2 = new NodeIPCMain('child2', cp2);

const store = createMaster();
store.attach(child1);
store.attach(child2);

store.on('test-event', (d, state) => {
	// console.log('got event %s', d);
	state.set(['data', 'process1'], d);
});

process.stdin.pipe(
	new Transform({
		transform(data, encoding, cb) {
			store.state.set(['data', 'xxx'], data.toString());
			cb();
		},
	})
);
