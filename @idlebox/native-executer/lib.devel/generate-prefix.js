const { resolveOutput } = await import('../scripts/build.js');
await import(resolveOutput('generate-prefix.js'));
