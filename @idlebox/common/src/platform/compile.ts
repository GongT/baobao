declare global {
	interface ImportMeta {
		env?: Record<string, string>;
	}
}
export const isProductionMode = import.meta.env?.['MODE'] === 'production';
