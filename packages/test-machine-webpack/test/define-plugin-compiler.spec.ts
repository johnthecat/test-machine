/// <reference types="mocha" />

import * as chai from 'chai';
import * as webpack from 'webpack';
import { definePluginCompilerFactory } from '../src/lib/define-plugin-compiler';

const normalizeString = (str: string): string => {
    return str.replace(/^ +/gm, '').trim();
};

describe('Define plugin compiler', () => {
    it('should replace constant', () => {
        const compiler = definePluginCompilerFactory(
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': 'production',
                'typeof window': 'object'
            })
        );

        const result = normalizeString(
            compiler({
                source: `
                    if (process.env.NODE_ENV === 'production') {
                        console.log(typeof window);
                    }
                `
            }, 'test.js').source
        );

        chai.expect(result).to.be.equal(normalizeString(`
            if (true) {
                console.log('object');
            }
        `));
    });
});
