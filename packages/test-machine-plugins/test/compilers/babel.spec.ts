/// <reference types="mocha" />

import * as chai from 'chai';
import { fs } from 'test-machine-test-utils';
import { excludeFromResolve } from '../utils/resolve';
import { babelCompiler } from '../../src/compilers/babel';

const readFile = fs.fileReaderFactory('./test');

describe('Babel compiler', () => {
    it('should fail, if babel-core isn\'t installed', () => {
        const restore = excludeFromResolve('babel-core');

        try {
            babelCompiler();
        } catch (exception) {
            chai.expect(exception).to.be.instanceof(Error);
        }

        restore();
    });

    it('should handle empty string', () => {
        const compiler = babelCompiler({
            presets: ['es2015']
        });

        const result = compiler({
            source: ''
        }, '');

        chai.expect(result.source).to.be.equal('');
    });

    it('should handle source code', async () => {
        const source = await readFile('./compilers/fixtures/import-export.js');
        const compiler = babelCompiler({
            presets: ['es2015']
        });

        const result = compiler({ source }, '');

        chai.expect(result.source).to.be.not.equal('');
        chai.expect(result.source).to.be.not.equal(source);
    });
});
