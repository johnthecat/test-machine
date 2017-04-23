/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />

import * as path from 'path';
import * as chai from 'chai';
import * as webpack from 'webpack';
import {configFactory, getTestRoots} from './utils/webpack.config';
import {mochaEngine} from '../../test-machine-plugins/src/engines/mocha';
import {babelCompiler} from '../../test-machine-plugins/src/compilers/babel';
import {TestMachineWebpack} from '../src';

describe('Webpack plugin', () => {
    it('should pass build', (done) => {
        const config = configFactory('simple-js', new TestMachineWebpack({
            testRoots: getTestRoots('simple-js'),
            engine: () => {
                return Promise.resolve();
            }
        }));

        const runner = webpack(config);

        runner.run((error) => {
            done(error);
        });
    });

    it('should return correct tests', (done) => {
        const roots = getTestRoots('simple-js');
        const root = roots[0];

        let testsException;

        const config = configFactory('simple-js', new TestMachineWebpack({
            testRoots: roots,
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            engine: (tests) => {
                try {
                    chai.expect(tests).to.be.deep.equal([
                        path.join(root, 'module-a.spec.js'),
                        path.join(root, 'module-b.spec.js')
                    ]);
                } catch (exception) {
                    testsException = exception;
                }

                return Promise.resolve();
            }
        }));

        webpack(config, (error) => {
            if (testsException) {
                done(testsException);
            } else {
                done(error);
            }
        });
    });

    it('should correctly handle different types of imports (using test-machine compilation)', (done) => {
        const config = configFactory('es6-export', new TestMachineWebpack({
            testRoots: getTestRoots('es6-export'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            compilers: [
                babelCompiler({
                    plugins: ['transform-es2015-modules-commonjs']
                })
            ],
            engine: mochaEngine({
                reporter(): void {

                }
            })
        }));

        webpack(config, (error) => {
            done(error);
        });
    });

    it('should correctly handle different types of imports (using babel-loader)', (done) => {
        const config = configFactory('es6-export', new TestMachineWebpack({
            testRoots: getTestRoots('es6-export'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            engine: mochaEngine({
                reporter(): void {

                }
            })
        }), {
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                plugins: ['transform-es2015-modules-commonjs']
                            }
                        }
                    }
                ]
            }
        });

        webpack(config, (error) => {
            done(error);
        });
    });

    it('should correctly fail test', (done) => {
        const config = configFactory('failing-test', new TestMachineWebpack({
            testRoots: getTestRoots('failing-test'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            engine: mochaEngine({
                reporter(): void {

                }
            })
        }));

        webpack(config, (error) => {
            if (error) {
                done();
            } else {
                done('Error wasn\'t handled');
            }
        });
    });

    it('should not fail test, if "failOnError" is true', (done) => {
        const config = configFactory('failing-test', new TestMachineWebpack({
            testRoots: getTestRoots('failing-test'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            engine: mochaEngine({
                reporter(): void {

                }
            }),
            failOnError: false
        }));

        webpack(config, (error) => {
            done(error);
        });
    });

    // TODO add tests for custom loaders resolve
});
