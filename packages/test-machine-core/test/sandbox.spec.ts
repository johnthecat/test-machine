/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />

import * as chai from 'chai';
import {readFile} from './utils/fs';
import {compiler} from '../../test-machine-plugins/src';
import {Sandbox} from '../src/lib/sandbox';

const createExport = (data) => {
    return `module.exports = ${JSON.stringify(data)}`;
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

    it('should have all primitives provided', (done) => {
        readFile('./fixtures/sandbox/primitives.js').then((source) => {
            const sandbox = new Sandbox(source, 'primitives.js');
            const module = sandbox.getExports();

            chai.expect(module).to.be.equal(true);

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

    it('should handle mock dependencies (static)', (done) => {
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

    it('should handle mock dependencies (sandbox)', (done) => {
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

    it('should set global variables into current context', (done) => {
        readFile('./fixtures/sandbox/global-variable.js').then((source) => {
            const sandbox = new Sandbox(source, 'global-variable.js');

            sandbox.getExports();

            const context = sandbox.getContext();

            chai.expect(context['amaGlobal']).to.be.equal(true);
            chai.expect(global['amaGlobal']).to.be.equal(void 0);

            done();
        });
    });
});