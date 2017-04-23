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

    it('should correctly cache previous result', () => {
        const compiler = new Compiler([
            (source) => source + ' 1'
        ]);

        const result1 = compiler.compile('0');
        const result2 = compiler.compile('0');

        chai.expect(result1).to.be.equal(result2);
    });

    it('should cleanup cache after pushing to pipeline', () => {
        const compiler = new Compiler([
            (source) => source + ' 1'
        ]);

        chai.expect(compiler.compile('0')).to.be.equal('0 1');

        compiler.push((source) => source + ' 2');

        chai.expect(compiler.compile('0')).to.be.equal('0 1 2');
    });
});
