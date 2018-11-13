/// <reference types="mocha" />

import * as path from 'path';
import * as chai from 'chai';
import { fs } from 'test-machine-test-utils';
import { babelCompiler } from '../../test-machine-plugins/src/compilers/babel';
import { Sandbox } from '../src/lib/sandbox';

const resolveFile = fs.fileResolverFactory(__dirname, 'fixtures', 'sandbox');
const readFixtures = fs.fileReaderFactory(__dirname, 'fixtures', 'sandbox');

const createExport = (data) => {
    return `module.exports = ${JSON.stringify(data)}`;
};

const createExportFromGlobal = (key) => {
    return `module.exports = global["${key}"];`;
};

describe('Sandbox', () => {
    afterEach(() => Sandbox.clearCache());

    context('Compilation', () => {
        it('should compile module', async () => {
            const source = await readFixtures('simple-module.js');

            const sandbox = new Sandbox(source, 'simple-module.js');
            const module = sandbox.getExports();

            chai.expect(module).to.be.equal('Hello, world!');
        });

        it('should throw exception, if code have some inner exceptions', async () => {
            const source = await readFixtures('eval-error.js');

            const sandbox = new Sandbox(source, 'eval-error.js');

            try {
                sandbox.getExports();

                return Promise.reject('Code was compiled');
            } catch (exception) {
            }
        });

        it('should give correct filename', async () => {
            const filename = 'root/test-file.js';
            const source = await readFixtures('simple-module.js');

            const sandbox = new Sandbox(source, filename);

            chai.expect(sandbox.getFilename()).to.be.equal(filename);

        });

        it('should apply compiler to source', async () => {
            const source = await readFixtures('es6-export.js');

            const compiler = babelCompiler({
                plugins: ['@babel/plugin-transform-modules-commonjs']
            });

            const sandbox = new Sandbox(source, 'es6-export.js', {
                compiler: (code) => compiler({ source: code }, ''),
                dependencies: {}
            });

            chai.expect(sandbox.getExports().testData).to.be.equal('es6 export');
        });

        it('should give correct compiled source', async () => {
            const source = await readFixtures('simple-module.js');
            const sandbox = new Sandbox(source, 'simple-module.js');

            sandbox.getExports();

            chai.expect(sandbox.getCompiledSource()).to.be.equal(source);
        });

        it('should give correct compiled source after applying compilation pipeline', async () => {
            const compilerPostfix = '\n const value = 1';
            const source = await readFixtures('simple-module.js');

            const sandbox = new Sandbox(source, 'simple-module.js', {
                compiler: (source) => ({
                    source: source + compilerPostfix
                })
            });

            sandbox.getExports();

            chai.expect(sandbox.getCompiledSource()).to.be.equal(`${source}${compilerPostfix}`);
        });

        it('should throw SyntaxError, when can\'t compile code', async () => {
            const source = await readFixtures('es6-export.js');
            const sandbox = new Sandbox(source, 'es6-export.js');

            try {
                sandbox.getExports();

                return Promise.reject('Code was compiled');
            } catch (error) {
                chai.expect(error).to.be.instanceof(SyntaxError);
            }
        });

        it('should correctly create multiple sandboxes with same source', async () => {
            const firstDep = 'test-1';
            const secondDep = 'test-2';
            const source = await readFixtures('pass-dependency.js');

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
        });

        it('should wrap string exception into EvalError', async () => {
            const source = await readFixtures('string-exception.js');
            const sandbox = new Sandbox(source, 'string-exception.js');

            try {
                sandbox.getExports();

                return Promise.reject('Code was compiled');
            } catch (exception) {
                chai.expect(exception).to.be.instanceof(EvalError);
            }
        });
    });

    context('Environment', () => {
        it('should have all primitives provided', async () => {
            const source = await readFixtures('primitives.js');
            const sandbox = new Sandbox(source, 'primitives.js');

            sandbox.getExports(); // should not throw
        });

        it('should correctly pass "instanceof" check for all primitives', async () => {
            const source = await readFixtures('primitives.js');
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
        });

        it('should set global variables into own context', async () => {
            const source = await readFixtures('global-variable.js');
            const sandbox = new Sandbox(source, 'global-variable.js');

            const module = sandbox.getExports();
            const context = sandbox.getContext();

            chai.expect(module).to.be.equal(true);
            chai.expect(context['amaGlobal']).to.be.equal(true);
            chai.expect(global['amaGlobal']).to.be.equal(void 0);
        });

        it('should correctly handle function declarations', async () => {
            const source = await readFixtures('function-declaration.js');
            const sandbox = new Sandbox(source, 'function-declaration.js');

            sandbox.getExports();

            chai.expect(sandbox.getExports()).to.be.equal(1);
        });

        it('should read global variables from current process context', () => {
            const key = '__$sandbox_test_dependency$__';
            const sandbox = new Sandbox(createExportFromGlobal(key), 'global.js');

            global[key] = {};

            sandbox.getExports();

            const context = sandbox.getContext();

            chai.expect(context[key]).to.be.equal(global[key]);

            delete global[key];
        });
    });

    context('Resolve', () => {
        it('should import from "node_modules"', async () => {
            const source = await readFixtures('external-dependency.js');
            const sandbox = new Sandbox(source, 'external-dependency.js');

            chai.expect(sandbox.getExports()).to.be.equal(true);

        });

        it('should import native module', async () => {
            const source = await readFixtures('native-dependency.js');
            const sandbox = new Sandbox(source, 'native-dependency.js');

            chai.expect(sandbox.getExports()).to.be.equal(true);
        });

        it('should throw ReferenceError, when can\'t resolve dependency', async () => {
            const source = await readFixtures('pass-dependency.js');
            const sandbox = new Sandbox(source, 'pass-dependency.js');

            try {
                sandbox.getExports();

                return Promise.reject('Code was compiled');
            } catch (error) {
                chai.expect(error).to.be.instanceof(ReferenceError);
            }
        });
    });

    context('Dependency injection', () => {
        it('should handle sandbox dependencies (as static)', async () => {
            const moduleExport = 'ama come from module!';

            const source = await readFixtures('pass-dependency.js');

            const sandbox = new Sandbox(source, 'pass-dependency.js', {
                dependencies: {
                    insertedDependency: moduleExport
                }
            });

            chai.expect(sandbox.getExports()).to.be.equal(moduleExport);
        });

        it('should handle sandbox dependencies (as sandbox)', async () => {
            const moduleExport = 'ama come from module!';
            const moduleContent = createExport(moduleExport);

            const source = await readFixtures('pass-dependency.js');

            const dependencySandbox = new Sandbox(moduleContent, '');

            const sandbox = new Sandbox(source, 'pass-dependency.js', {
                dependencies: {
                    insertedDependency: dependencySandbox
                }
            });

            chai.expect(sandbox.getExports()).to.be.equal(moduleExport);
        });

        it('should handle mock dependencies', async () => {
            const source = await readFixtures('pass-dependency.js');

            const pathToMock = resolveFile('mock.js');
            const mock = require(pathToMock);

            const sandbox = new Sandbox(source, path.resolve('./test/fixtures/sandbox/pass-dependency.js'), {
                mocks: {
                    [path.resolve('./test/fixtures/sandbox/insertedDependency')]: pathToMock
                }
            });

            chai.expect(sandbox.getExports()).to.be.equal(mock);
        });

        it('should throw ReferenceError, if can\'t resolve mock', async () => {
            const source = await readFixtures('pass-dependency.js');
            const sandbox = new Sandbox(source, path.resolve('./test/fixtures/sandbox/pass-dependency.js'), {
                mocks: {}
            });

            try {
                sandbox.getExports();

                return Promise.reject('Code was compiled');
            } catch (exception) {
                chai.expect(exception).to.be.instanceof(ReferenceError);
            }
        });
    });

    context('Exports', () => {
        it('should correctly handle exports reference', async () => {
            const source = await readFixtures('exports-reference.js');
            const sandbox = new Sandbox(source, 'exports-reference.js');

            chai.expect(sandbox.getExports().data).to.be.equal(true);
        });

        it('should add fields to "module" object', async () => {
            const source = await readFixtures('module-mutation.js');
            const sandbox = new Sandbox(source, 'module-mutation.js');

            const module = sandbox.getExports();
            const context = sandbox.getContext();

            chai.expect(module).to.be.equal(true);
            chai.expect(context.module.customField).to.be.equal(true);
        });

        it('should correctly provide commonjs module.exports object', async () => {
            const source = await readFixtures('commonjs-module-exports.js');
            const sandbox = new Sandbox(source, 'commonjs-module-exports.js');

            chai.expect(sandbox.getExports().equals).to.be.equal(true);
        });

        it('should correctly provide commonjs exports object', async () => {
            const source = await readFixtures('commonjs-exports.js');
            const sandbox = new Sandbox(source, 'commonjs-exports.js');

            chai.expect(sandbox.getExports().equals).to.be.equal(true);
        });
    });
});
