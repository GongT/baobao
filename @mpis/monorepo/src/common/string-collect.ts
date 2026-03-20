export class StringCollect<T> {
	private readonly buffers = new Map<T, string[]>();

	append(id: T, str: string) {
		const list = this.buffers.get(id);
		if (!list) {
			this.buffers.set(id, [str]);
		} else {
			list.push(str);
		}
	}

	get(id: T) {
		return this.buffers.get(id)?.join('') ?? '';
	}

	clear(id: T) {
		this.buffers.set(id, []);
	}
}
