import { EnableLogLevel, set_default_log_level } from '@idlebox/logger/browser';
import { LocalStorageObject, StorageKey } from '../storage/local-storage.js';

interface IDevStore {
	readonly logger: {
		readonly enabled: Record<string, EnableLogLevel>;
		readonly defaultLevel: EnableLogLevel;
	};
	readonly delayNetworkSeconds: number;
}

export const develSettings = new LocalStorageObject<IDevStore>(StorageKey.Development, {
	logger: {
		enabled: {} as Record<string, EnableLogLevel>,
		defaultLevel: EnableLogLevel.log,
	},
	delayNetworkSeconds: 0,
});

Object.defineProperty(window, 'devel', {
	value: develSettings.active(),
	writable: true,
	configurable: false,
	enumerable: true,
});
develSettings.onChange(() => {
	Object.assign(window, { devel: develSettings.active() });
});

/////////// 应用设置到 logger ///////////
develSettings.onChange(applySettings);
applySettings(develSettings.data);
function applySettings(data: IDevStore) {
	// for (const [tag, level] of Object.entries(data.logger.enabled)) {
	// }
	// TODO: logger库现在还没写单独配置接口
	set_default_log_level(data.logger.defaultLevel);
}
