/// <reference types="node" />

import { defineEsbuild } from '@mpis/esbuild';
import { makeConfig } from './config.js';

await defineEsbuild('native-executer', makeConfig());
