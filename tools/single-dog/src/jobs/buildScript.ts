import { registerPlugin, setProjectDir } from '@idlebox/build-script';

export async function runBuildScriptInit() {

	setProjectDir(process.cwd());
	await registerPlugin('@idlebox/single-dog-asset/register', []);
}
