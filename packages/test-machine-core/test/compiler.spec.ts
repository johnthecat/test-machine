/// <reference types="mocha" />

import * as chai from 'chai';
import { Compiler } from '../src/lib/compiler';

describe('CompilerFunction', () => {
    it('should pass source through pipeline', () => {
        const compiler = new Compiler([
            ({ source }) => ({ source: source + ' 1' }),
            ({ source }) => ({ source: source + ' 2' }),
            ({ source }) => ({ source: source + ' 3' })
        ]);

        const result = compiler.compile('0');

        chai.expect(result.source).to.be.equal('0 1 2 3');
    });

    it('should push compiler to main pipeline', () => {
        const compiler = new Compiler([
            ({ source }) => ({ source: source + ' 1' })
        ]);

        compiler.push(
            ({ source }) => ({ source: source + ' 2' })
        );

        const result = compiler.compile('0');

        chai.expect(result.source).to.be.equal('0 1 2');
    });

    it('should correctly cache previous result', () => {
        const compiler = new Compiler([
            ({ source }) => ({ source: source + ' 1' })
        ]);

        const result1 = compiler.compile('0');
        const result2 = compiler.compile('0');

        chai.expect(result1).to.be.equal(result2);
    });

    it('should cleanup cache after pushing to pipeline', () => {
        const compiler = new Compiler([
            ({ source }) => ({ source: source + ' 1' })
        ]);

        const result1 = compiler.compile('0');

        chai.expect(result1.source).to.be.equal('0 1');

        compiler.push(
            ({ source }) => ({ source: source + ' 2' })
        );

        const result2 = compiler.compile('0');

        chai.expect(result2.source).to.be.equal('0 1 2');
    });

    it('shouldn\'t fail, when compilation plugin has wrong input', () => {
        const compiler = new Compiler([
            () => (null as any)
        ]);
        const result = compiler.compile('0');

        chai.expect(result.source).to.be.equal('0');
    });
});
