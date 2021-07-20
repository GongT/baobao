import { DeferredPromise } from '@idlebox/common';
export interface IJob<T> {
	(arg: T): Promise<void>;
}
interface IJob0 {
	(): Promise<void>;
}

const debug = /\brush[-_]?tools\b/i.test(process.env.NODE_DEBUG || '')
	? (...args: any[]) => {
			console.error(...args);
	  }
	: (..._args: any[]) => {};

export class RunQueue<T> {
	private readonly items = new Map<string, QueueItem>();

	constructor(private readonly job: IJob<T>, private readonly concurrent = 4) {}

	register(id: string, arg: T, deps: ReadonlyArray<string>) {
		this.items.set(id, new QueueItem(this.job.bind(undefined, arg), deps));
	}

	async run() {
		let running = 0;
		let dfd: DeferredPromise<void> | null;
		const doneOf = (id: string) => {
			return () => {
				running--;
				debug(' end (%s) %s', running, id);
				if (dfd) {
					debug(' concurrent release...');
					dfd.complete();
					dfd = null;
				}
				for (const item of this.items.values()) {
					item.notify(id);
				}
			};
		};

		debug(' Jobs:');
		for (const id of this.items.keys()) {
			debug('  %s', id);
		}

		while (this.items.size > 0) {
			for (const [id, job] of this.items.entries()) {
				if (running >= this.concurrent) {
					debug(' concurrent max');
					break;
				}
				if (job.isDepsClear()) {
					running++;
					debug(' run job (%s) %s', running, id);
					this.items.delete(id);
					job.run(doneOf(id));
				} else {
					debug(' schedule job %s', id);
				}
			}

			if (running > 0) {
				dfd = new DeferredPromise();
				await dfd.p;
				debug(' continue...');
			}
		}
	}
}

class QueueItem {
	private readonly deps: string[];
	private hasRun = false;

	constructor(private readonly job: IJob0, deps: ReadonlyArray<string>) {
		this.deps = [...deps];
	}

	public isDepsClear() {
		return this.deps.length === 0;
	}

	notify(dep: string) {
		if (this.deps.length === 0) {
			return true;
		}
		const isMyDep = this.deps.indexOf(dep);
		if (isMyDep >= 0) {
			this.deps.splice(isMyDep, 1);
		}
		return this.deps.length === 0;
	}

	run(done: () => void) {
		if (this.hasRun) {
			console.error('re-run job!!!');
			throw new Error('re-run some job');
		}
		this.hasRun = true;
		return new Promise<void>((resolve) => setTimeout(resolve, 0)).then(this.job).then(done);
	}
}
