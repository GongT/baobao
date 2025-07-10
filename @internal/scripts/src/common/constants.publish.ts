export const lifecycleEventName = process.env.lifecycle_event;
if (!lifecycleEventName) {
	throw new Error('脚本仅通过 @mpis/publisher 调用.');
}
export const isPublish = lifecycleEventName === 'publish';
