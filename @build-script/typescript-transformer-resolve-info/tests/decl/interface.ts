interface InternalInterface {
	field1: number;
}
export interface Interface extends InternalInterface {
	field2: string;
}

export interface InterfaceWithClass {
	x: number;
	y: string;
}

export class InterfaceWithClass implements InterfaceWithClass {
	declare x: number;
	declare y: string;
}
