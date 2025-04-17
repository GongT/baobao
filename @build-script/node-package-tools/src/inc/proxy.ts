import { getEnvironment } from '@idlebox/node';
import { execaCommand } from 'execa';
import { getPackageManager } from '../packageManage/detectRegistry.js';
import { logger } from './log.js';

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
		logger.log(`using HTTPS_PROXY = ${opts.HTTPS_PROXY}`);
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
		logger.log(`no HTTPS_PROXY/HTTP_PROXY/ALL_PROXY/PROXY`);
		return;
	}
	logger.log(`using global proxy: ${v}`);
	opts.HTTPS_PROXY = opts.HTTP_PROXY = v;
}

async function setNoProxy() {
	const opts = globalAgentSettings();
	if (typeof opts.NO_PROXY === 'string') {
		logger.debug(`using NO_PROXY = ${opts.NO_PROXY}`);
		return;
	}

	const envVar = getEnvironment('NO_PROXY');
	if (envVar.value) {
		logger.debug(`using env.NO_PROXY = ${envVar.value}`);
		opts.NO_PROXY = envVar.value;
		return;
	}

	const pm = await getPackageManager();
	const noproxy = (await execaCommand(pm + ' config get noproxy', { stderr: 'ignore' })).stdout;
	if (noproxy === 'undefined') {
		logger.debug(`no NO_PROXY`);
	} else {
		logger.debug(`using npmrc::noproxy = ${noproxy}`);
		opts.NO_PROXY = envVar.value;
	}
}
