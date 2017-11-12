import { createHash } from 'crypto';

class Collection<V = any> {

    private _store = Collection.createStore<V>();

    private _size = 0;

    constructor(private useHashing = false) {}

    public has(key: string): boolean {
        const normalizedKey = this._normalizeKey(key);

        return this._has(normalizedKey);
    }

    public get(key: string): V | void {
        const normalizedKey = this._normalizeKey(key);

        if (this._has(normalizedKey) === true) {
            return this._store[normalizedKey];
        }

        return void 0;
    }

    public set(key: string, value: V): void {
        const normalizedKey = this._normalizeKey(key);

        if (this._has(normalizedKey) === false) {
            this._size++;
        }

        this._store[normalizedKey] = value;
    }

    public delete(key: string): void {
        const normalizedKey = this._normalizeKey(key);

        if (this._has(normalizedKey) === true) {
            delete this._store[normalizedKey];
            this._size--;
        }
    }

    public fill(dictionary: { [key: string]: V }): void {
        for (let key in dictionary) {
            if (
                typeof dictionary.hasOwnProperty !== 'function' ||
                dictionary.hasOwnProperty(key)
            ) {
                this.set(key, dictionary[key]);
            }
        }
    }

    public clear(): void {
        this._store = Collection.createStore();
        this._size = 0;
    }

    public size(): number {
        return this._size;
    }

    public getStore(): any {
        return this._store;
    }

    private _normalizeKey(key: string): string {
        if (this.useHashing === false) {
            return key;
        }

        return Collection.getHash(key);
    }

    private _has(key: string): boolean {
        return (key in this._store);
    }

    private static createStore<V>(): { [key: string]: V } {
        return Object.create(null);
    }

    private static getHash(source: string): string {
        return createHash('md5').update(source).digest('hex');
    }

}

export { Collection };
