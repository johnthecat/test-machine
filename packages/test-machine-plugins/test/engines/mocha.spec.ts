/// <reference types="mocha" />

import * as chai from 'chai';
import { resolve } from '../utils/fs';
import { excludeFromResolve } from '../utils/resolve';
import { mochaEngine } from '../../src/engines/mocha';

describe('Mocha engine', () => {
    it('should fail, if mocha isn\'t installed', () => {
        const restore = excludeFromResolve('mocha');

        try {
            mochaEngine();
        } catch (exception) {
            chai.expect(exception).to.be.instanceof(Error);
        }

        restore();
    });

    it('should pass without tests', (done) => {
        const runner = mochaEngine();

        runner([])
            .then(() => done());
    });

    it('should reject, when mocha can\'t run tests', (done) => {
        const runner = mochaEngine();

        runner([ 'fake-test.js' ])
            .catch((e) => done());
    });

    it('should complete, when mocha test passed', (done) => {
        const runner = mochaEngine({
            reporter(): void {
                // avoid logs
            }
        });

        runner([
            resolve('./engines/fixtures/correct-test-set.js')
        ])
            .then(() => done());
    });

    it('should fail, when mocha test not passed', (done) => {
        const runner = mochaEngine({
            reporter(): void {
                // avoid logs
            }
        });

        runner([
            resolve('./engines/fixtures/incorrect-test-set.js')
        ])
            .catch(() => done());
    });
});
