#!/usr/bin/env -S node --enable-source-maps --import=@idlebox/native-executer/register

import '@idlebox/native-executer/register/respawn';

await import('../src/bins/list-monorepo-projects.ts');
