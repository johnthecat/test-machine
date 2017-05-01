/// <reference types="mocha" />

import { TRouter } from '../src/interface';

import * as chai from 'chai';
import * as path from 'path';
import { TestExtractor } from '../src/lib/test-extractor';

const ROOT = path.join(__dirname, 'fixtures', 'test-extractor');
const ROOT1 = path.join(ROOT, 'root1');
const ROOT2 = path.join(ROOT, 'root2');

const TESTS = {
    'module-1': path.join(ROOT1, 'module-1.js'),
    'module-2': path.join(ROOT1, 'module-2.js'),
    'module-3': path.join(ROOT1, 'module-3.js'),
    'module-3.more': path.join(ROOT1, 'module-3.more.js'),
    'module-4': path.join(ROOT2, 'module-4.js')
};

// TODO add contexts

describe('TestExtractor', () => {
    it('should pass parsed path into router', (done) => {
        const router = (resource: path.ParsedPath) => {
            chai.expect(resource.dir).to.be.equal('root');
            chai.expect(resource.name).to.be.equal('module');
            chai.expect(resource.ext).to.be.equal('.js');

            done();

            return '';
        };

        const testExtractor = new TestExtractor([ ROOT1 ], router);

        testExtractor.extractTests([ 'root/module.js' ]);
    });

    it('should return all tests from given root using abstract route (\'**/*\')', () => {
        const router = () => '**/*';

        const root1Extractor = new TestExtractor([ ROOT1 ], router);
        const root1 = root1Extractor.extractTests([ 'module.js' ]);

        chai.expect(root1).to.deep.equal([
            TESTS[ 'module-1' ],
            TESTS[ 'module-2' ],
            TESTS[ 'module-3' ],
            TESTS[ 'module-3.more' ]
        ]);

        const root2Extractor = new TestExtractor([ ROOT2 ], router);
        const root2 = root2Extractor.extractTests([ 'module.js' ]);

        chai.expect(root2).to.deep.equal([
            TESTS[ 'module-4' ]
        ]);
    });

    it('should correct use cache of globs', () => {
        const router = () => '**/*';

        const testExtractor = new TestExtractor([ ROOT1 ], router);
        const woCache = testExtractor.extractTests([ 'module.js' ]);
        const wCache = testExtractor.extractTests([ 'module.js' ]);

        chai.expect(woCache).to.deep.equal(wCache);
    });

    it('should correctly clear cache', () => {
        const router = () => '**/*';

        const testExtractor = new TestExtractor([ ROOT1 ], router);
        const result1 = testExtractor.extractTests([ 'module.js' ]);

        testExtractor.clearCache();

        const result2 = testExtractor.extractTests([ 'module.js' ]);

        chai.expect(result1).to.deep.equal(result2);
    });

    it('should return specific files, when filename passed', () => {
        const router = (resource: path.ParsedPath) => `**/${resource.name}.js`;

        const testExtractor = new TestExtractor([ ROOT1 ], router);
        const tests = testExtractor.extractTests([ 'module-1.js', 'module-2.js' ]);

        chai.expect(tests).to.deep.equal([
            TESTS[ 'module-1' ],
            TESTS[ 'module-2' ],
        ]);
    });

    it('should handle globs array from router', () => {
        const router = (resource: path.ParsedPath) => {
            return [
                `**/${resource.name}.js`,
                `**/${resource.name}.more.js`
            ];
        };

        const testExtractor = new TestExtractor([ ROOT1 ], router);
        const tests = testExtractor.extractTests([ 'module-3.js' ]);

        chai.expect(tests).to.deep.equal([
            TESTS[ 'module-3' ],
            TESTS[ 'module-3.more' ]
        ]);
    });

    it('should ignore tests, when empty string returned for router', () => {
        const router = () => '';

        const testExtractor = new TestExtractor([ ROOT1 ], router);
        const tests = testExtractor.extractTests([ 'module-1.js', 'module-2.js' ]);

        chai.expect(tests.length).to.be.equal(0);
    });

    it('should not fail, when incorrect data passed from router', () => {
        const router: TRouter = (): any => ({ fail: true });

        const testExtractor = new TestExtractor([ ROOT1 ], router);
        const tests = testExtractor.extractTests([ 'module-1.js', 'module-2.js' ]);

        chai.expect(tests.length).to.be.equal(0);
    });

    it('should not fail, when incorrect data passed from router (as array)', () => {
        const router: TRouter = (resource: path.ParsedPath): any => {
            return [
                `**/${resource.name}.js`,
                '',
                { fail: true }
            ];
        };

        const testExtractor = new TestExtractor([ ROOT1 ], router);
        const tests = testExtractor.extractTests([ 'module-1.js' ]);

        chai.expect(tests).to.deep.equal([
            TESTS[ 'module-1' ]
        ]);
    });

    it('should always return empty array, if test roots not specified', () => {
        const router = () => '';

        const testExtractor = new TestExtractor([], router);
        const tests = testExtractor.extractTests([ 'module-1.js', 'module-4.js' ]);

        chai.expect(tests.length).to.be.equal(0);
    });

    it('should return empty array, if changedModules are not array', () => {
        const router = () => '';

        const testExtractor = new TestExtractor([ ROOT1 ], router);
        const tests = testExtractor.extractTests(({} as Array<string>));

        chai.expect(tests.length).to.be.equal(0);
    });

    it('should return empty array, if changedModules has invalid value', () => {
        const router = () => '';

        const testExtractor = new TestExtractor([ ROOT1 ], router);
        const tests = testExtractor.extractTests([ ({} as string) ]);

        chai.expect(tests.length).to.be.equal(0);
    });
});
