import { respawnInScope } from '../lib/_export_all_in_one_index.js';

console.log('running pid:', process.pid);
console.log('process.env.NEVER_UNSHARE=%s', process.env.NEVER_UNSHARE);
respawnInScope(function () {
	console.log('main function called in pid:', process.pid);

	setTimeout(() => {}, 1000000);

	console.log('sleeping...');
});
console.log('exit pid:', process.pid);
