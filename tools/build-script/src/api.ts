import load from './api/loadToGulp';
import initWorkspace from './api/initWorkspace';
import callGulpScript from './api/callGulpScript';
import buildContextData from './api/buildContextApi';
import register from './api/registerPlugin';

import { pathExists } from 'fs-extra';
import { resolve } from 'path';

export const loadToGulp = load;
export const init = initWorkspace;
export const call = callGulpScript;
export const registerPlugin = register;
export const buildContext = buildContextData;

export function isBuildConfigFileExists(path: string): Promise<boolean> {
	return pathExists(resolve(path, 'build-script.json'));
}

