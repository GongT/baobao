import {createConfig} from '@internal/local-rig/profiles/default/eslint.config.js';
// require('@rushstack/eslint-config/patch/modern-module-resolution');
export default createConfig(import.meta.dirname);
