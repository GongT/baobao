import { getEnvironment } from '@idlebox/node';
import { bootstrap, type ProxyAgentConfigurationType } from 'global-agent';
import { logger } from '../functions/log.js';
import type { IPackageManager } from './package-manager.js';

let proxy_override_by_env = false;

export function globalAgentSettings(): ProxyAgentConfigurationType {
	return (globalThis as any).GLOBAL_AGENT;
}

export async function reconfigureProxyWithNpmrc(pm: IPackageManager) {
	if (proxy_override_by_env) return;

	logger.debug('通过npm设置代理服务器:');
	const p = await pm.getConfig('proxy');
	const np = await pm.getConfig('noproxy');
	const opts = globalAgentSettings();

	if (opts.HTTP_PROXY !== p) {
		logger.debug(`   * proxy server = ${p}`);
		opts.HTTP_PROXY = opts.HTTPS_PROXY = p || '';
	}
	if (opts.NO_PROXY !== np) {
		logger.debug(`   * no_proxy = ${np}`);
		opts.NO_PROXY = np || '';
	}

	applyEnv();
}

export function configureProxyFromEnvironment() {
	bootstrap({
		environmentVariableNamespace: '',
		forceGlobalAgent: true,
		socketConnectionTimeout: 1000,
	});

	const opts = globalAgentSettings();
	logger.debug('通过环境变量设置代理服务器:');

	const envVar = getEnvironment('NO_PROXY');
	if (envVar.value) {
		logger.debug(`   * no_proxy = ${envVar.value}`);

		opts.NO_PROXY = envVar.value;
	} else {
		opts.NO_PROXY = null;
		logger.debug('   * no_proxy = <unset>');
	}

	let v = getEnvironment('http_proxy').value;
	if (!v) {
		v = getEnvironment('https_proxy').value;
		if (!v) {
			v = getEnvironment('all_proxy').value;
			if (!v) {
				v = getEnvironment('proxy').value;
			}
		}
	}

	if (v) {
		logger.debug(`   * proxy server = ${v}`);
		opts.HTTPS_PROXY = opts.HTTP_PROXY = v;
		proxy_override_by_env = true;
	} else {
		opts.HTTPS_PROXY = opts.HTTP_PROXY = null;
		logger.debug('   * proxy server = <unset>');
	}

	applyEnv();
}

function applyEnv() {
	const opts = globalAgentSettings();

	process.env.http_proxy = opts.HTTP_PROXY || '';
	process.env.https_proxy = opts.HTTP_PROXY || '';
	process.env.all_proxy = opts.HTTP_PROXY || '';
	process.env.no_proxy = opts.NO_PROXY || '';
}
