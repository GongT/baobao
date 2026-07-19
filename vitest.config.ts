import { defineConfig } from 'vitest/config';

export default defineConfig({
	cacheDir: `${import.meta.dirname}/.vite/vitest`,
});
