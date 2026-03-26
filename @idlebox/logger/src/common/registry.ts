import { isProductionMode, SoftwareDefectError } from '@idlebox/common';
import type { IMyLogger } from './types.js';

export let loggersRegistry: Map<string, IMyLogger> | undefined;
let somethingCreated = false;

export function loggersRegistrySet(logger: IMyLogger) {
	if (!loggersRegistry) {
		if (!isProductionMode) somethingCreated = true;
		return;
	}
	loggersRegistry.set(logger.tag, logger);
}

export function getAllLoggers(): readonly IMyLogger[] {
	return Array.from(requiresEnabled().values());
}

export function enableLoggerRegistry() {
	if (loggersRegistry !== undefined) return;

	loggersRegistry = new Map();

	if (!isProductionMode) {
		if (somethingCreated) console.warn('检测到在启用日志注册表之前已经创建了logger实例，之前创建的实例无法通过注册表访问');
	}
}

export function deleteLoggerInstance(tag: string) {
	requiresEnabled().delete(tag);
}

export function getAllLoggerNames(): readonly string[] {
	return Array.from(requiresEnabled().keys());
}

function requiresEnabled() {
	if (!loggersRegistry) {
		throw new SoftwareDefectError('logger registry is not enabled');
	}
	return loggersRegistry;
}
