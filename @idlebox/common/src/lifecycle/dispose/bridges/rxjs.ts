interface Unsubscribable {
	unsubscribe(): void;
}
export function unsubscribableToDisposable(subscription: Unsubscribable) {
	return { dispose: () => subscription.unsubscribe() };
}
