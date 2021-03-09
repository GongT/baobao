import { createSlave, NodeIPCChild } from '../../..';

const pid = process.argv[process.argv.length - 1];

const driver = new NodeIPCChild('p' + pid);
const store = createSlave(driver);

if (pid == '1') {
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
} else {
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
