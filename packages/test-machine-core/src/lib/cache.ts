import {getHash} from './utils';

class Cache<V> {

    private store: any = Cache.createStore();

    constructor(private useHashing = false) {}

    public has(key: string): boolean {
        const normalizedKey = this.normalizeKey(key);

        return (normalizedKey in this.store);
    }

    public get(key: string): V | void {
        const normalizedKey = this.normalizeKey(key);

        if (normalizedKey in this.store) {
            return this.store[normalizedKey];
        }

        return void 0;
    }

    public set(key: string, value: V): void {
        const normalizedKey = this.normalizeKey(key);

        this.store[normalizedKey] = value;
    }

    public delete(key: string): void {
        const normalizedKey = this.normalizeKey(key);

        if (this.has(normalizedKey)) {
            delete this.store[normalizedKey];
        }
    }

    public clear(): void {
        this.store = Cache.createStore();
    }

    public getStore(): any {
        return this.store;
    }

    private normalizeKey(key: string): string {
        if (this.useHashing === false) {
            return key;
        }

        return getHash(key);
    }

    private static createStore(): any {
        return Object.create(null);
    }
}

export {Cache};
