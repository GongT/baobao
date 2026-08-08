if (!process.env.CI || process.env.npm_lifecycle_event === 'postinstall') {
	await import('../scripts/build.js');
}

await import('../lib/register-or-respawn.js');
