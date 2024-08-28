import { getEnvironment } from '@idlebox/node';
import { execaCommand } from 'execa';
import { getPackageManager } from '../packageManage/detectRegistry';
import { debug } from './log';

interface IGlobalAgentSetting {
	HTTP_PROXY?: string;
	HTTPS_PROXY?: string;
	NO_PROXY?: string;
}

export function globalAgentSettings(): IGlobalAgentSetting {
	return (globalThis as any).GLOBAL_AGENT;
}

export async function configureProxy() {
	setProxy();
	await setNoProxy();
}

export function getProxyValue() {
	return globalAgentSettings().HTTPS_PROXY;
}
export function getNoProxyValue() {
	return globalAgentSettings().NO_PROXY;
}

function setProxy() {
	const opts = globalAgentSettings();
	if (opts.HTTPS_PROXY) {
		debug(`using HTTPS_PROXY = ${opts.HTTPS_PROXY}`);
		opts.HTTP_PROXY = opts.HTTPS_PROXY;
		return;
	}

	let v = getEnvironment('HTTP_PROXY').value;
	if (!v) {
		v = getEnvironment('HTTPS_PROXY').value;
		if (!v) {
			v = getEnvironment('ALL_PROXY').value;
			if (!v) {
				v = getEnvironment('PROXY').value;
			}
		}
	}
	if (!v) {
		debug(`no HTTPS_PROXY/HTTP_PROXY/ALL_PROXY/PROXY`);
		return;
	}
	debug(`using global proxy: ${v}`);
	opts.HTTPS_PROXY = opts.HTTP_PROXY = v;
}

async function setNoProxy() {
	const opts = globalAgentSettings();
	if (typeof opts.NO_PROXY === 'string') {
		debug(`using NO_PROXY = ${opts.NO_PROXY}`);
		return;
	}

	const envVar = getEnvironment('NO_PROXY');
	if (envVar.value) {
		debug(`using env.NO_PROXY = ${envVar}`);
		opts.NO_PROXY = envVar.value;
		return;
	}

	const pm = await getPackageManager();
	const noproxy = (await execaCommand(pm + ' config get noproxy', { stderr: 'ignore' })).stdout;
	if (noproxy === 'undefined') {
		debug(`no NO_PROXY`);
	} else {
		debug(`using npmrc::noproxy = ${noproxy}`);
		opts.NO_PROXY = envVar.value;
	}
}
