/// <reference types="mocha" />

import * as chai from 'chai';
import { noModuleException } from '../src/utils';

describe('Utils', () => {
    context('noModuleException', () => {
        it('should return Error', () => {
            const error = noModuleException('myModule');

            chai.expect(error).to.be.instanceof(Error);
            chai.expect(error.message).to.includes('myModule');
        });
    });
});
