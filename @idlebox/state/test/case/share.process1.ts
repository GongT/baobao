import { StateSlave } from '../..';

export function createProcessLogic_1(store: StateSlave) {
	setInterval(() => {
		const n = Date.now();
		// console.log('process 1 tick', n);
		store.trigger('test-event', n);
	}, 1000);
	store.subscribe({ xxx: ['data', 'xxx'] }).then(
		(res) => {
			res.onChange((e) => {
				console.log('process 1 get xxx change:', e.xxx);
			});
		},
		(e) => {
			setImmediate(() => {
				throw e;
			});
		}
	);
}
