export type Ref<T = any> = { reference: T };

export function Pointer<T>(_object: Ref<T>): T {
	const object = _object as any;

	return new Proxy(
		{},
		{
			apply(_, thisArg, argArray) {
				return Reflect.apply(object.reference, thisArg, argArray);
			},
			construct(_, argArray, new_) {
				return Reflect.construct(object.reference, argArray, new_);
			},
			defineProperty(_, property, attributes) {
				return Reflect.defineProperty(object.reference, property, attributes);
			},
			deleteProperty(_, p) {
				return Reflect.deleteProperty(object.reference, p);
			},
			get(_, p, _receiver) {
				const value = object.reference[p];
				if (typeof value === 'function') {
					return value.bind(object.reference);
				}
				return value;
			},
			getOwnPropertyDescriptor(_, p) {
				return Reflect.getOwnPropertyDescriptor(object.reference, p);
			},
			getPrototypeOf(_) {
				return Reflect.getPrototypeOf(object);
			},
			has(_, p) {
				return Reflect.has(object.reference, p);
			},
			isExtensible(_) {
				return Reflect.isExtensible(object);
			},
			ownKeys(_) {
				return Reflect.ownKeys(object);
			},
			preventExtensions(_) {
				return Reflect.preventExtensions(object);
			},
			set(_, p, newValue, receiver) {
				return Reflect.set(object.reference, p, newValue, receiver);
			},
			setPrototypeOf(_, v) {
				return Reflect.setPrototypeOf(object.reference, v);
			},
		},
	) as any;
}
