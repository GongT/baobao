import { RushProject } from '@build-script/rush-tools';
import { fromTimeStamp, getTimeStamp } from '@idlebox/common';
import { loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/node-json-edit';
import { normalizePackageName } from './paths';

export class ProjectStateCache {
	constructor(private readonly rushProject: RushProject) {}

	async project(name: string) {
		const stateFile = this.rushProject.tempFile('proj_status/' + normalizePackageName(name) + '.json');
		const state = new ProjectState(stateFile);
		await state.init();
		return state;
	}
}

export class ProjectState {
	private state: Record<string, any> = {};

	constructor(private readonly stateFile: string) {}

	async init() {
		this.state = await loadJsonFileIfExists(this.stateFile, {});
	}

	get lastPublishVersion(): string | undefined {
		return this.state['last-publish-version'];
	}
	set lastPublishVersion(v: string) {
		this.state['last-publish-version'] = v;
	}

	get lastPublishTime(): Date | undefined {
		return fromTimeStamp(this.state['last-publish-time']);
	}
	set lastPublishTime(v: Date) {
		this.state['last-publish-time'] = getTimeStamp(v);
	}

	async save() {
		await writeJsonFileBack(this.state);
	}
}
