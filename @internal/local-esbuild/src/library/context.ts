import esbuild from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { minimatch } from 'minimatch';
import { dirname, join, resolve } from 'node:path';
import { entryFiles } from './args.js';
import { esbuildProblemMatcherPlugin } from './matcher.js';

export type WithCallback<T> = (context: T) => void;

const projectRoot = process.cwd();

class BuildContextHost implements esbuild.BuildContext {
	private created = false;
	private readonly buildctx: esbuild.BuildContext[] = [];

	public withOptions(callback: WithCallback<esbuild.BuildOptions>) {
		if (this.created) {
			throw new Error('too late to modify build options');
		}
		callback(options);
	}

	async create() {
		if (this.created) {
			throw new Error('already created');
		}
		this.created = true;
		options.plugins?.push(fileWriter, esbuildProblemMatcherPlugin);
		this.buildctx.push(await esbuild.context(options));
	}

	rebuild(): Promise<esbuild.BuildResult<esbuild.BuildOptions>> {
		return this.buildctx[0].rebuild();
	}
	watch(options?: esbuild.WatchOptions): Promise<void> {
		return this.buildctx[0].watch(options);
	}
	serve(options?: esbuild.ServeOptions): Promise<esbuild.ServeResult> {
		return this.buildctx[0].serve(options);
	}
	cancel(): Promise<void> {
		return this.buildctx[0].cancel();
	}
	dispose(): Promise<void> {
		return this.buildctx[0].dispose();
	}
}

const fileWriter: esbuild.Plugin = {
	name: 'write-file',
	setup(build) {
		const writeCache = new Map<string, string>();

		build.onEnd(async (result) => {
			if (!result.outputFiles) {
				console.error('[esbuild:write] no files to write');
				return;
			}

			const meta = new MetaFile(result.metafile!);

			for (const virtual of result.outputFiles) {
				const rpath = virtual.path.replace(/^.*@virtual\//, '');
				const entry = meta.output(rpath).entryPoint;
				if (!entry) {
					// esbuild may support cjs split in future? (probably not)
					throw new Error(`output file not have entry: ${rpath}`);
				}

				const outfile = join(matchMapEntry(entry), rpath);
				if (writeCache.get(outfile) === virtual.hash) {
					console.log(`[esbuild:write] ${outfile} (unchange)`);
					continue;
				}

				console.log(`[esbuild:write] ${outfile}`);
				const outfileabs = resolve(projectRoot, outfile);

				await mkdir(dirname(outfileabs), { recursive: true });
				await writeFile(outfileabs, virtual.contents);

				writeCache.set(outfile, virtual.hash);
			}
		});
	},
};

function matchMapEntry(entry: string) {
	for (const [from, to] of entryFiles.entries()) {
		if (minimatch(entry, from)) {
			return to;
		}
	}
	throw new Error(`known entry file: ${entry}`);
}

class MetaFile {
	constructor(private readonly metafile: esbuild.Metafile) {}

	output(outfile: string) {
		outfile = outfile.replace(/\.map$/, '');
		for (const file of Object.keys(this.metafile.outputs)) {
			if (file.endsWith(outfile)) {
				return this.metafile.outputs[file];
			}
		}
		throw new Error(`output file not inside metadata: ${outfile}`);
	}
}

const options: esbuild.BuildOptions = {
	entryPoints: [...entryFiles.keys()],
	absWorkingDir: projectRoot,
	metafile: true,
	write: false,
	outdir: 'temp/@virtual',
	bundle: true,
	format: 'cjs',
	minify: false,
	sourcemap: true,
	sourcesContent: true,
	platform: 'node',
	external: ['typescript'],
	logLevel: 'silent',
	tsconfig: 'src/tsconfig.json',
	assetNames: '[name]',
	treeShaking: true,
	define: {},
	loader: {},
	plugins: [],
};

export const buildctx = new BuildContextHost();
