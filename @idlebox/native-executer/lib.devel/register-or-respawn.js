const { resolveOutput } = await import('../scripts/build.js');
await import(resolveOutput('register-or-respawn.js'));
