import { isModuleResolutionError } from '@idlebox/common';
import { channelClient } from '@mpis/client';
import type esbuild from 'esbuild';
import { createRequire } from 'node:module';

type Opt = esbuild.BuildOptions & ({ watch?: esbuild.WatchOptions } | { serve?: esbuild.ServeOptions });

type OptionOrFunc = Opt | (() => Opt | Promise<Opt>);

function loadLocalEsbuild(): typeof esbuild | null {
	try {
		const require = createRequire(process.argv[1]);
		return require('esbuild');
	} catch (error) {
		if (isModuleResolutionError(error)) {
			console.log('esbuild not found in project, using private.');
			return null;
		}
		throw error;
	}
}

export async function defineEsbuild(title: string, options: OptionOrFunc): Promise<esbuild.BuildContext> {
	const esb: typeof esbuild = loadLocalEsbuild() || (await import('esbuild').then((m) => m.default || m));

	channelClient.friendlyTitle = title;

	if (typeof options === 'function') {
		options = await options();
	}

	if (!options.plugins) options.plugins = [];

	options.plugins.push({
		name: 'build-protocol',
		setup(build) {
			build.onStart(() => {
				console.log('[watch] build started');
				channelClient.start();
			});

			build.onEnd((result) => {
				const errors: string[] = [];
				for (const error of result.errors) {
					errors.push(`> ${error.location?.file}:${error.location?.line}:${error.location?.column}: error: ${error.text}`);
				}
				for (const error of result.warnings) {
					errors.push(`> ${error.location?.file}:${error.location?.line}:${error.location?.column}: warning: ${error.text}`);
				}

				console.log('[watch] build finished');
				if (errors.length) {
					channelClient.failed('esbuild build failed', errors.join('\n'));
					console.error(errors.join('\n'));
				} else {
					channelClient.success('esbuild build finished');
				}
			});
		},
	});

	const ctx = await esb.context(options);

	if (process.argv.includes('--watch') || process.argv.includes('-w')) {
		if ('serve' in options) {
			await ctx.serve(options.serve);
		} else {
			await ctx.watch((options as any).watch);
		}
	} else {
		await ctx.rebuild();
	}

	return ctx;
}
