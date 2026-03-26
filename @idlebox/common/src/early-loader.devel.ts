/**
 *  这个文件是为了让 early-loader 在开发环境下能够正常工作而存在的
 */

import { convertCaughtError } from './error/convert-unknown.js';
import { prettyFormatError, prettyPrintError } from './error/pretty.nodejs.js';
import { createStackTraceHolder } from './error/stack-trace.js';
import { globalObject } from './platform/globalObject.js';

export { convertCaughtError, createStackTraceHolder, globalObject, prettyFormatError, prettyPrintError };
