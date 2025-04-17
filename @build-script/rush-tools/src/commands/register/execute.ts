import { registerProjectToRush } from '../../api/register.js';
import type { ArgOf } from '../../common/args.js';

/** @internal */
export async function runRegister({ project }: ArgOf<typeof import('./arguments')>) {
	await registerProjectToRush(project);
}
