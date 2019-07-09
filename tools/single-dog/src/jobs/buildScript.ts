import { init, registerPlugin } from '@idlebox/build-script';

export async function runBuildScriptInit() {
	await init(CONTENT_ROOT);
	await registerPlugin(CONTENT_ROOT, '@gongt/single-dog/register');
}
