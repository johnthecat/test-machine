/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />

import * as path from 'path';
import * as chai from 'chai';
import {readFile} from './utils/fs';
import {compiler} from '../../test-machine-plugins/src';
import {Sandbox} from '../src/lib/sandbox';

const createExport = (data) => {
    return `module.exports = ${JSON.stringify(data)}`;
};

const createExportFromGlobal = (key) => {
    return `module.exports = global["${key}"];`;
};

describe('Sandbox', () => {
    afterEach(() => Sandbox.clearCache());

    it('should compile module', (done) => {
        readFile('./fixtures/sandbox/simple-module.js').then((source) => {
            const sandbox = new Sandbox(source, 'simple-module.js');
            const module = sandbox.getExports();

            chai.expect(module).to.be.equal('Hello, world!');

            done();
        });
    });

    it('should give correct filename', (done) => {
        const filename = 'root/test-file.js';

        readFile('./fixtures/sandbox/simple-module.js').then((source) => {
            const sandbox = new Sandbox(source, filename);

            chai.expect(sandbox.getFilename()).to.be.equal(filename);

            done();
        });
    });

    it('should have all primitives provided', (done) => {
        readFile('./fixtures/sandbox/primitives.js').then((source) => {
            const sandbox = new Sandbox(source, 'primitives.js');

            try {
                sandbox.getExports();
                done();
            } catch (exception) {
                done(exception);
            }
        });
    });

    it('should correctly pass "instanceof" check for all primitives', (done) => {
        readFile('./fixtures/sandbox/primitives.js').then((source) => {
            const sandbox = new Sandbox(source, 'primitives.js');
            const {
                array,
                map,
                set,
                weakMap,
                weakSet,
                promise,
                buffer
            } = sandbox.getExports();

            chai.expect(array instanceof Array).to.be.equal(true);
            chai.expect(map instanceof Map).to.be.equal(true);
            chai.expect(set instanceof Set).to.be.equal(true);
            chai.expect(weakMap instanceof WeakMap).to.be.equal(true);
            chai.expect(weakSet instanceof WeakSet).to.be.equal(true);
            chai.expect(promise instanceof Promise).to.be.equal(true);
            chai.expect(buffer instanceof Buffer).to.be.equal(true);

            done();
        });
    });

    it('should apply compiler to source', (done) => {
        readFile('./fixtures/sandbox/es6-export.js').then((source) => {
            const sandbox = new Sandbox(source, 'es6-export.js', {
                compiler: compiler.babel({
                    plugins: ['transform-es2015-modules-commonjs']
                }),
                dependencies: {}
            });

            const module = sandbox.getExports();

            chai.expect(module.testData).to.be.equal('es6 export');

            done();
        });
    });

    it('should handle sandbox dependencies (as static)', (done) => {
        const moduleExport = 'ama come from module!';

        readFile('./fixtures/sandbox/pass-dependency.js').then((source) => {
            const sandbox = new Sandbox(source, 'pass-dependency.js', {
                dependencies: {
                    insertedDependency: moduleExport
                }
            });

            const module = sandbox.getExports();

            chai.expect(module).to.be.equal(moduleExport);

            done();
        });
    });

    it('should handle sandbox dependencies (as sandbox)', (done) => {
        const moduleExport = 'ama come from module!';
        const moduleContent = createExport(moduleExport);

        readFile('./fixtures/sandbox/pass-dependency.js').then((source) => {
            const dependencySandbox = new Sandbox(moduleContent, '');

            const sandbox = new Sandbox(source, 'pass-dependency.js', {
                dependencies: {
                    insertedDependency: dependencySandbox
                }
            });

            const module = sandbox.getExports();

            chai.expect(module).to.be.equal(moduleExport);

            done();
        });
    });

    it('should handle mock dependencies', (done) => {
        const pathToMock = require.resolve('./fixtures/sandbox/mock.js');

        readFile('./fixtures/sandbox/pass-dependency.js').then((source) => {
            const sandbox = new Sandbox(source, path.resolve('./test/fixtures/sandbox/pass-dependency.js'), {
                mocks: {
                    [path.resolve('./test/fixtures/sandbox/insertedDependency')]: pathToMock
                }
            });

            const module = sandbox.getExports();
            const mock = require(pathToMock);

            chai.expect(module).to.be.equal(mock);

            done();
        });
    });

    it('should correctly create multiple sandboxes with same source', (done) => {
        const firstDep = 'test-1';
        const secondDep = 'test-2';

        readFile('./fixtures/sandbox/pass-dependency.js').then((source) => {
            const firstSandbox = new Sandbox(source, 'pass-dependency.js', {
                dependencies: {
                    insertedDependency: firstDep
                }
            });

            const secondSandbox = new Sandbox(source, 'pass-dependency.js', {
                dependencies: {
                    insertedDependency: secondDep
                }
            });

            chai.expect(firstSandbox.getExports()).to.be.equal(firstDep);
            chai.expect(secondSandbox.getExports()).to.be.equal(secondDep);

            done();
        });
    });

    it('should import from "node_modules"', (done) => {
        readFile('./fixtures/sandbox/external-dependency.js').then((source) => {
            const sandbox = new Sandbox(source, 'external-dependency.js');
            const module = sandbox.getExports();

            chai.expect(module).to.be.equal(true);

            done();
        });
    });

    it('should import native module', (done) => {
        readFile('./fixtures/sandbox/native-dependency.js').then((source) => {
            const sandbox = new Sandbox(source, 'native-dependency.js');
            const module = sandbox.getExports();

            chai.expect(module).to.be.equal(true);

            done();
        });
    });

    it('should throw SyntaxError, when can\'t compile code', (done) => {
        readFile('./fixtures/sandbox/es6-export.js').then((source) => {
            const sandbox = new Sandbox(source, 'es6-export.js');

            try {
                sandbox.getExports();

                done('Code was compiled');
            } catch (error) {
                chai.expect(error).to.be.instanceof(SyntaxError);
            }

            done();
        });
    });

    it('should throw ReferenceError, when can\'t resolve dependency', (done) => {
        readFile('./fixtures/sandbox/pass-dependency.js').then((source) => {
            const sandbox = new Sandbox(source, 'pass-dependency.js');

            try {
                sandbox.getExports();

                done('Code was compiled');
            } catch (error) {
                chai.expect(error).to.be.instanceof(ReferenceError);
            }

            done();
        });
    });

    it('should set global variables into own context', (done) => {
        readFile('./fixtures/sandbox/global-variable.js').then((source) => {
            const sandbox = new Sandbox(source, 'global-variable.js');

            const module = sandbox.getExports();
            const context = sandbox.getContext();

            chai.expect(module).to.be.equal(true);
            chai.expect(context['amaGlobal']).to.be.equal(true);
            chai.expect(global['amaGlobal']).to.be.equal(void 0);

            done();
        });
    });

    it('should read global variables from current process context', () => {
        const key = '__$test$__';
        const sandbox = new Sandbox(createExportFromGlobal(key), 'global.js');

        global[key] = {};

        sandbox.getExports();

        const context = sandbox.getContext();

        chai.expect(context[key]).to.be.equal(global[key]);

        delete global[key];
    });

    it('should correctly handle function declarations', (done) => {
        readFile('./fixtures/sandbox/function-declaration.js').then((source) => {
            const sandbox = new Sandbox(source, 'function-declaration.js');

            sandbox.getExports();

            chai.expect(sandbox.getExports()).to.be.equal(1);

            done();
        });
    });

    it('should correctly provide commonjs exports object', (done) => {
        readFile('./fixtures/sandbox/commonjs-export.js').then((source) => {
            const sandbox = new Sandbox(source, 'commonjs-export.js');

            const exports = sandbox.getExports();

            chai.expect(exports.equals).to.be.equal(true);

            done();
        });
    });
});
