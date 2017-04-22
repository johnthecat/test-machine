import {getHash} from './utils';

class Collection<V> {

    private _store: any = Collection.createStore();

    private _size = 0;

    constructor(private useHashing = false) {}

    public has(key: string): boolean {
        const normalizedKey = this._normalizeKey(key);

        return this._has(normalizedKey);
    }

    public get(key: string): V | void {
        const normalizedKey = this._normalizeKey(key);

        if (normalizedKey in this._store) {
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

        if (this._has(normalizedKey)) {
            delete this._store[normalizedKey];
            this._size--;
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

        return getHash(key);
    }

    private _has(key: string): boolean {
        return (key in this._store);
    }

    private static createStore(): any {
        return Object.create(null);
    }
}

export {Collection};