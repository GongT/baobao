import { StateSlave } from '../../../state/dist/state-public';

export function createProcessLogic_2(store: StateSlave) {
	store.subscribe({ timeValue: ['data', 'process1'] }).then(
		(res) => {
			res.onChange((e) => {
				console.log('process 2 get time change:', e.timeValue);
			});
		},
		(e) => {
			setImmediate(() => {
				throw e;
			});
		}
	);
	store.subscribe({ xxx: ['data', 'xxx'] }).then(
		(res) => {
			res.onChange((e) => {
				console.log('process 2 get xxx change:', e.xxx);
			});
		},
		(e) => {
			setImmediate(() => {
				throw e;
			});
		}
	);
}
