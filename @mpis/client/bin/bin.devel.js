#!/usr/bin/env node

import { execute } from "@idlebox/esbuild-executer";
execute(import.meta.resolve("../src/bin.ts"));
