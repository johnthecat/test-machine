/// <reference types="mocha" />

import * as chai from 'chai';
import { fs } from 'test-machine-test-utils';
import { excludeFromResolve } from '../utils/resolve';
import { mochaEngine } from '../../src/engines/mocha';

const fixtureResolver = fs.fileResolverFactory(__dirname, './fixtures');

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

    it('should pass without tests', () => {
        const runner = mochaEngine();

        return runner([]);
    });

    it('should reject, when mocha can\'t run tests', (done) => {
        const runner = mochaEngine();

        runner(['fake-test.js']).catch((e) => done());
    });

    it('should complete, when mocha test passed', () => {
        const runner = mochaEngine({
            reporter(): void {
                // avoid logs
            }
        });

        return runner([
            fixtureResolver('./correct-test-set.js')
        ]);
    });

    it('should fail, when mocha test not passed', (done) => {
        const runner = mochaEngine({
            reporter(): void {
                // avoid logs
            }
        });

        runner([
            fixtureResolver('./incorrect-test-set.js')
        ])
            .catch(() => done());
    });
});
