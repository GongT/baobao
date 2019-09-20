import { installBuildScript, registerPlugin } from '@idlebox/build-script';

export async function runBuildScriptInit() {
	await installBuildScript(CONTENT_ROOT);
	await registerPlugin(CONTENT_ROOT, '@gongt/single-dog/register');
}
