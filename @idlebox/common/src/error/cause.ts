export function getRootCause(e: Error): Error {
	let current = e;
	while (current.cause instanceof Error) {
		current = current.cause;
	}
	return current;
}

export function getCauseStack(e: Error): Error[] {
	const stack: Error[] = [];
	let current = e;
	while (current) {
		stack.push(current);
		if (current.cause instanceof Error) {
			current = current.cause;
		} else {
			break;
		}
	}
	return stack;
}
