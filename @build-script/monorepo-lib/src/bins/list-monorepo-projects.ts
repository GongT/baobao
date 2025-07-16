import { createWorkspace } from '../workspace/common/create.js';

const w = await createWorkspace();
const projects = await w.listPackages();

const dump = projects.map((p) => {
	return {
		name: p.name,
		relative: p.relative,
		absolute: p.absolute,
		version: p.packageJson.version,
		private: p.packageJson.private,
	};
});
console.log(JSON.stringify(dump, null, 2));
