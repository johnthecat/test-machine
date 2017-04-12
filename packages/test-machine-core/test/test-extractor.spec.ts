/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />

import * as chai from 'chai';
import * as path from 'path';
import {TestExtractor} from '../src/lib/test-extractor';
import {TRouter} from '../src/interface';

const ROOT = path.join(__dirname, 'fixtures', 'test-extractor');
const TESTS = {
    'module-1': path.join(ROOT, 'module-1.js'),
    'module-2': path.join(ROOT, 'module-2.js'),
    'module-3': path.join(ROOT, 'module-3.js'),
    'module-3.more': path.join(ROOT, 'module-3.more.js'),
};

describe('TestExtractor', () => {
    it('should pass parsed path into router', (done) => {
        const router = (resource: path.ParsedPath) => {
            chai.expect(resource.dir).to.be.equal('root');
            chai.expect(resource.name).to.be.equal('module');
            chai.expect(resource.ext).to.be.equal('.js');

            done();

            return '';
        };

        const testExtractor = new TestExtractor(ROOT, router);

        testExtractor.extractTests(['root/module.js']);
    });

    it('should return all tests from abstract route', () => {
        const router = () => '**/*';

        const testExtractor = new TestExtractor(ROOT, router);
        const tests = testExtractor.extractTests(['module.js']);

        chai.expect(tests).to.deep.equal([
            TESTS['module-1'],
            TESTS['module-2'],
            TESTS['module-3'],
            TESTS['module-3.more']
        ]);
    });

    it('should return specific files, when filename passed', () => {
        const router = (resource: path.ParsedPath) => `**/${resource.name}.js`;

        const testExtractor = new TestExtractor(ROOT, router);
        const tests = testExtractor.extractTests(['module-1.js', 'module-2.js']);

        chai.expect(tests).to.deep.equal([
            TESTS['module-1'],
            TESTS['module-2'],
        ]);
    });

    it('should handle globs array from router', () => {
        const router = (resource: path.ParsedPath) => {
            return [
                `**/${resource.name}.js`,
                `**/${resource.name}.more.js`
            ];
        };

        const testExtractor = new TestExtractor(ROOT, router);
        const tests = testExtractor.extractTests(['module-3.js']);

        chai.expect(tests).to.deep.equal([
            TESTS['module-3'],
            TESTS['module-3.more']
        ]);
    });

    it('should ignore tests, when empty string returned for router', () => {
        const router = () => '';

        const testExtractor = new TestExtractor(ROOT, router);
        const tests = testExtractor.extractTests(['module-1.js', 'module-2.js']);

        chai.expect(tests.length).to.be.equal(0);
    });

    it('should not fail, when incorrect data passed from router', () => {
        const router: TRouter = (): any => ({fail: true});

        const testExtractor = new TestExtractor(ROOT, router);
        const tests = testExtractor.extractTests(['module-1.js', 'module-2.js']);

        chai.expect(tests.length).to.be.equal(0);
    });

    it('should not fail, when incorrect data passed from router (as array)', () => {
        const router: TRouter = (resource: path.ParsedPath): any => {
            return [
                `**/${resource.name}.js`,
                {fail: true}
            ];
        };

        const testExtractor = new TestExtractor(ROOT, router);
        const tests = testExtractor.extractTests(['module-1.js']);

        chai.expect(tests).to.deep.equal([
            TESTS['module-1']
        ]);
    });
});