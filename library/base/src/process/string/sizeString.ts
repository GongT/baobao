const unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function sizeHuman(size: number) {
	if (size < 0) {
		return '<0B';
	}
	for (let i = 0; i < unit.length; i++) {
		if (size < 1024) {
			return size.toFixed(0) + unit[i];
		}
		size = size / 1024;
	}
	return '>1EB';
}
