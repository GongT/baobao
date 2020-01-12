import { resolve } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { eachProject, getCurrentRushRootPath } = require('../../@idlebox/rush-tools');

const root = getCurrentRushRootPath();
for (const { projectFolder } of eachProject()) {
	const path = resolve(root, projectFolder);
	
	if(
}
