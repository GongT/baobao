import { manifest } from 'pacote';

export async function resolveLatestVersionOnNpm(packageName: string) {
	return '^' + (await manifest(packageName + '@latest')).version;
}
