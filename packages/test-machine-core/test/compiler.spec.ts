/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />

import * as chai from 'chai';
import {Compiler} from '../src/lib/compiler';

describe('Compiler', () => {
    it('should pass source through pipeline', () => {
        const compiler = new Compiler([
            (source) => source + ' 1',
            (source) => source + ' 2',
            (source) => source + ' 3'
        ]);

        const result = compiler.compile('0');

        chai.expect(result).to.be.equal('0 1 2 3');
    });

    it('should push compiler to main pipeline', () => {
        const compiler = new Compiler([
            (source) => source + ' 1'
        ]);

        compiler.push((source) => source + ' 2');

        const result = compiler.compile('0');

        chai.expect(result).to.be.equal('0 1 2');
    });
});