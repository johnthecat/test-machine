/// <reference types="mocha" />

import * as path from 'path';
import * as chai from 'chai';
import {fileResolverFactory} from '../src/fs';

describe('FS util', () => {
    it('should resolve path, correctly', () => {
        const resolver = fileResolverFactory('packages', 'test-machine-test-utils');

        chai.expect(resolver('src')).to.be.equal(path.resolve('packages', 'test-machine-test-utils', 'src'));
    });
});
