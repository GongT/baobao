import { isWindows } from '@idlebox/common';

import * as _posix from './mpath.posix.js';
import * as common from './mpath.unified.js';
import * as _win32 from './mpath.win32.js';
import { makePathApi, type IPathApi } from './types.js';

const w = makePathApi(_win32, common);
const p = makePathApi(_posix, common);

interface IPathApiAll extends IPathApi {
	readonly win32: IPathApi;
	readonly posix: IPathApi;
}

export const mpath: IPathApiAll = {
	...(isWindows ? w : p),
	win32: w,
	posix: p,
};
