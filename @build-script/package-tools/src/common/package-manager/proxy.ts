import { escapeRegExp } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { getEnvironment } from '@idlebox/node';
import type { IPackageManager } from './package-manager.js';

let proxy_override_by_env = false;

function makeRe(str: string) {
	const reTxt = str
		.split('*')
		.map((v) => escapeRegExp(v))
		.join('.+');
	return new RegExp(`^${reTxt}$`, 'i');
}

export function getProxyValue(url: string) {
	const proxyValue = process.env.http_proxy;
	if (!proxyValue) {
		return '';
	}
	logger.verbose`get proxy for: ${url}`;
	if (!process.env.no_proxy) {
		logger.verbose`using http_proxy directly`;
		return proxyValue;
	}

	let domain: string;
	if (url.includes('://')) {
		domain = new URL(url).hostname;
	} else {
		domain = url.split('/')[0];
	}
	if (!domain) {
		throw new Error(`无法从URL中获取域名: ${url}`);
	}

	logger.verbose`  trying no_proxy: ${process.env.no_proxy} | ${domain}`;

	const noProxy = process.env.no_proxy.split(',').map((s) => s.trim());
	for (const npPart of noProxy) {
		logger.verbose`- ${npPart}`;
		if (npPart.includes('*')) {
			const re = makeRe(npPart);
			if (re.test(domain)) {
				logger.verbose(`  hit regexp`);
				return '';
			}
		} else {
			if (domain === npPart) {
				logger.verbose(`  hit equals`);
				return '';
			}
			const domainEnding = npPart[0] === '.' ? npPart : '.' + npPart;
			if (domain.endsWith(domainEnding)) {
				logger.verbose(`  hit ending: ${domainEnding}`);
				return '';
			}
		}
	}

	logger.verbose`  not hit no_proxy, using http_proxy`;
	return proxyValue;
}

export async function reconfigureProxyWithNpmrc(pm: IPackageManager) {
	if (proxy_override_by_env) return;

	logger.debug('通过npm设置代理服务器:');
	const p = await pm.getConfig('proxy');
	const np = await pm.getConfig('noproxy');

	if (p) {
		logger.debug(`   * proxy server = ${p}`);
	}
	if (np) {
		logger.debug(`   * no_proxy = ${np}`);
	}

	applyEnv(p || '', np || '');
}

export function configureProxyFromEnvironment() {
	// bootstrap({
	// 	environmentVariableNamespace: '',
	// 	forceGlobalAgent: true,
	// 	socketConnectionTimeout: 1000,
	// });

	logger.debug('通过环境变量设置代理服务器:');

	let noProxy = '';
	const envVar = getEnvironment('NO_PROXY');
	if (envVar.value) {
		logger.debug(`   * no_proxy = ${envVar.value}`);

		noProxy = envVar.value;
	} else {
		noProxy = '';
		logger.debug('   * no_proxy = <unset>');
	}

	let httpProxy = getEnvironment('http_proxy').value || '';
	if (!httpProxy) {
		httpProxy = getEnvironment('https_proxy').value || '';
		if (!httpProxy) {
			httpProxy = getEnvironment('all_proxy').value || '';
			if (!httpProxy) {
				httpProxy = getEnvironment('proxy').value || '';
			}
		}
	}

	if (httpProxy) {
		logger.debug(`   * proxy server = ${httpProxy}`);
		proxy_override_by_env = true;
		applyEnv(httpProxy, noProxy);
	} else {
		logger.debug('   * proxy server = <unset>');
		proxy_override_by_env = false;
		applyEnv('', '');
	}
}

function applyEnv(proxy: string, noproxy: string) {
	process.env.http_proxy = proxy;
	process.env.https_proxy = proxy;
	process.env.all_proxy = proxy;
	process.env.no_proxy = noproxy;
}
