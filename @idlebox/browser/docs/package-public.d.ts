
export declare class TimeoutStorage<T> {
    private readonly key;
    private readonly storage;
    private readonly valueKey;
    private readonly expireKey;
    constructor(key: string, storage?: Storage);
    save(data: Readonly<T>, expire: string | Date): void;
    forget(): void;
    read(defaultVal: Readonly<T>): Readonly<T>;
    read(): Readonly<T> | undefined;
}

export { }
