if (process.env.CI) {
	const fs = await import('node:fs');
	const path = await import('node:path');
	if (!fs.existsSync(path.resolve(import.meta.dirname, '../lib/register-or-respawn.js'))) {
		await import('../scripts/build.js');
	}
} else {
	await import('../scripts/build.js');
}

await import('../lib/register-or-respawn.js');
