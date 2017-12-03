/// <reference types="node" />
/// <reference types="mocha" />

import * as chai from 'chai';
import { Collection } from '../src/lib/collection';

describe('Collection', () => {
    it('should store any type of value', () => {
        const collection = new Collection();

        collection.set('set', new Set());
        collection.set('map', new Map());
        collection.set('weakMap', new WeakMap());
        collection.set('weakSet', new WeakSet());

        chai.expect(collection.has('set')).to.be.equal(true);
        chai.expect(collection.has('map')).to.be.equal(true);
        chai.expect(collection.has('weakMap')).to.be.equal(true);
        chai.expect(collection.has('weakSet')).to.be.equal(true);

        chai.expect(collection.size()).to.be.equal(4);

        chai.expect(collection.get('set')).to.be.instanceof(Set);
        chai.expect(collection.get('map')).to.be.instanceof(Map);
        chai.expect(collection.get('weakMap')).to.be.instanceof(WeakMap);
        chai.expect(collection.get('weakSet')).to.be.instanceof(WeakSet);
    });

    it('should return correct store', () => {
        const collection = new Collection();

        collection.set('set', new Set());

        const store = collection.getStore();

        chai.expect(store).to.be.deep.equal({
            set: new Set()
        });
    });

    it('should store value correctly (with hashing)', () => {
        const collection = new Collection(true);

        const key = 'some long key';
        const data = {};

        collection.set(key, data);

        chai.expect(collection.has(key)).to.be.equal(true);
        chai.expect(collection.get(key)).to.be.equal(data);
        chai.expect(collection.size()).to.be.equal(1);
    });

    it('should override collection item', () => {
        const collection = new Collection();

        const key = 'some long key';
        const data = {};

        collection.set(key, 1);
        collection.set(key, data);

        chai.expect(collection.get(key)).to.be.equal(data);
        chai.expect(collection.size()).to.be.equal(1);
    });

    it('should override collection item (with hashing)', () => {
        const collection = new Collection(true);

        const key = 'some long key';
        const data = {};

        collection.set(key, 1);
        collection.set(key, data);

        chai.expect(collection.get(key)).to.be.equal(data);
        chai.expect(collection.size()).to.be.equal(1);
    });

    it('should delete by key', () => {
        const key1 = 'some long key 1';
        const key2 = 'some long key 2';
        const data = {};

        const woHash = new Collection();

        woHash.set(key1, data);
        woHash.set(key2, data);

        chai.expect(woHash.size()).to.be.equal(2);

        woHash.delete(key1);

        chai.expect(woHash.has(key1)).to.be.equal(false);
        chai.expect(woHash.has(key2)).to.be.equal(true);
        chai.expect(woHash.size()).to.be.equal(1);
    });

    it('should delete by key with hashing', () => {
        const key1 = 'some long key 1';
        const key2 = 'some long key 2';
        const data = {};

        const wHash = new Collection(true);

        wHash.set(key1, data);
        wHash.set(key2, data);

        chai.expect(wHash.size()).to.be.equal(2);

        wHash.delete(key1);

        chai.expect(wHash.has(key1)).to.be.equal(false);
        chai.expect(wHash.has(key2)).to.be.equal(true);
        chai.expect(wHash.size()).to.be.equal(1);
    });

    it('should clean store', () => {
        const collection = new Collection(true);

        collection.set('1', 1);
        collection.set('2', 2);
        collection.set('3', 3);

        collection.clear();

        chai.expect(collection.has('1')).to.be.equal(false);
        chai.expect(collection.has('2')).to.be.equal(false);
        chai.expect(collection.has('3')).to.be.equal(false);
        chai.expect(collection.size()).to.be.equal(0);
    });

    it('should fill collection with values from object', () => {
        const collection = new Collection();

        collection.fill({
            'a': 1,
            'b': 2
        });

        chai.expect(collection.get('a')).to.be.equal(1);
        chai.expect(collection.get('b')).to.be.equal(2);
        chai.expect(collection.size()).to.be.equal(2);
    });

    it('should fill collection with values from object without prototype', () => {
        const collection = new Collection();

        const object = Object.create(null);

        object.a = 1;
        object.b = 2;

        collection.fill(object);

        chai.expect(collection.get('a')).to.be.equal(1);
        chai.expect(collection.get('b')).to.be.equal(2);
        chai.expect(collection.size()).to.be.equal(2);
    });
});
