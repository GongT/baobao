import { Transform } from 'stream';
import { StateMaster } from '../../../state/dist/state-public';

export function createMainLogic(store: StateMaster) {
	store.on('test-event', (d, state) => {
		// console.log('got event %s', d);
		state.set(['data', 'process1'], d);
	});

	process.stdin.pipe(
		new Transform({
			transform(data, _encoding, cb) {
				store.state.set(['data', 'xxx'], data.toString());
				cb();
			},
		})
	);
}
