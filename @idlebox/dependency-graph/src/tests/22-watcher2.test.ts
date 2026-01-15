import { sleep } from '@idlebox/common';
import { JobGraphBuilder } from '../common/job-graph.build.js';
import { SimpleJob } from '../common/simple-job.js';
import './test-lib.js';

function makeFn(name: string) {
	return async function (this: SimpleJob<any>) {
		console.log(`[${name}] Executing...`);
		await sleep(500);
		console.log(`[${name}] Finished.`);
	};
}

const dep = new JobGraphBuilder();

dep.addNode(new SimpleJob('aaa', ['bbb', 'ccc'], makeFn('aaa')));
dep.addNode(new SimpleJob('bbb', ['ddd'], makeFn('bbb')));
dep.addNode(new SimpleJob('ccc', ['ddd'], makeFn('ccc')));
dep.addNode(new SimpleJob('ddd', [], makeFn('ddd')));

dep.finalize();

async function main() {
	await dep
		.finalize()
		.startup()
		.catch((e) => {
			throw e;
		});
}

main();
