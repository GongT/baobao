export default function testFunction(a1: string): void;
export default function testFunction(a1: string, a2: number): void;
export default function testFunction(a1: string, a2?: number) {
	console.log(a1, a2);
}

export function testNamedFunction(): number {
	return 42;
}
