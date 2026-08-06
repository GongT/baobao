import babel from '@rolldown/plugin-babel';
import { defineConfig } from 'vitest/config';

function decoratorPreset(options: Record<string, unknown>) {
	return {
		preset: () => ({
			plugins: [['@babel/plugin-proposal-decorators', options]],
		}),
		rolldown: {
			filter: { code: '@' },
		},
	};
}

export default defineConfig({
	cacheDir: `${import.meta.dirname}/.vite/vitest`,
	plugins: [
		babel({
			presets: [decoratorPreset({ version: '2023-11' })],
		}),
	],
});
