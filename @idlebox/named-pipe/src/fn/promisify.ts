type Closable = {
	close(callback?: (err?: any) => void): void;
};
export function asyncClose(s: Closable): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		s.close((err: any) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

type Endable = {
	end(callback?: () => void): void;
};
export function asyncEnd(s: Endable): Promise<void> {
	return new Promise<void>((resolve) => {
		s.end(() => {
			resolve();
		});
	});
}

export async function asyncEndAll(s: readonly Endable[]): Promise<void> {
	await Promise.all(s.map(asyncEnd));
}
