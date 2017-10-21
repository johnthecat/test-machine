/// <reference types="mocha" />

import * as path from 'path';
import * as chai from 'chai';
import * as webpack from 'webpack';
import { configFactory, getRoot, getTestRoots } from './utils/webpack.config';
import { mochaEngine } from '../../test-machine-plugins/src/engines/mocha';
import { babelCompiler } from '../../test-machine-plugins/src/compilers/babel';
import { TestMachineWebpack } from '../src';

import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import { compiler } from '../../test-machine-plugins/src/index';

const DEFAULT_ENGINE_CONFIG = {
    reporter(): void {

    }
};

describe('Webpack plugin', () => {
    it('should fail, if engine not passed', (done) => {
        try {
            const plugin = new TestMachineWebpack({
                failOnError: true
            });

            done(`No exception ${plugin}`);
        } catch (e) {
            done();
        }
    });

    it('should pass build', (done) => {
        const config = configFactory('simple-js', new TestMachineWebpack({
            failOnError: true,
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
            failOnError: true,
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

    it('should correctly work with webpack.optimize.ModuleConcatenationPlugin', (done) => {
        const config = configFactory('module-concatenation-plugin', new TestMachineWebpack({
            failOnError: true,
            testRoots: getTestRoots('module-concatenation-plugin'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            compilers: [
                babelCompiler({
                    plugins: ['transform-es2015-modules-commonjs']
                })
            ],
            engine: mochaEngine(DEFAULT_ENGINE_CONFIG)
        }), {
            plugins: [
                new webpack.optimize.ModuleConcatenationPlugin()
            ]
        });

        const runner = webpack(config);

        runner.run((error) => {
            done(error);
        });
    });

    it('should correctly handle different types of imports (using test-machine compilation)', (done) => {
        const config = configFactory('es6-export', new TestMachineWebpack({
            failOnError: true,
            testRoots: getTestRoots('es6-export'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            compilers: [
                babelCompiler({
                    plugins: ['transform-es2015-modules-commonjs']
                })
            ],
            engine: mochaEngine(DEFAULT_ENGINE_CONFIG)
        }));

        webpack(config, (error) => {
            done(error);
        });
    });

    it('should correctly handle different types of imports (using babel-loader)', (done) => {
        const config = configFactory('es6-export', new TestMachineWebpack({
            failOnError: true,
            testRoots: getTestRoots('es6-export'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            engine: mochaEngine(DEFAULT_ENGINE_CONFIG)
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
            failOnError: true,
            testRoots: getTestRoots('failing-test'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            engine: mochaEngine(DEFAULT_ENGINE_CONFIG)
        }));

        webpack(config, (error) => {
            if (error) {
                done();
            } else {
                done('Error wasn\'t handled');
            }
        });
    });

    it('should not fail test, if "failOnError" is false', (done) => {
        const config = configFactory('failing-test', new TestMachineWebpack({
            failOnError: false,
            testRoots: getTestRoots('failing-test'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            engine: mochaEngine(DEFAULT_ENGINE_CONFIG)
        }));

        webpack(config, (error) => {
            done(error);
        });
    });

    it('should handle css with ExtractTextPlugin', (done) => {
        const extractCSS = new ExtractTextPlugin('stylesheets/css-modules.css');
        const config = configFactory('css-modules', new TestMachineWebpack({
            failOnError: true,
            testRoots: getTestRoots('css-modules'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            engine: mochaEngine(DEFAULT_ENGINE_CONFIG)
        }), {
            module: {
                rules: [
                    {
                        test: /\.css$/,
                        use: extractCSS.extract([{
                            loader: 'css-loader',
                            options: {
                                modules: true
                            }
                        }])
                    }
                ]
            },
            plugins: [
                extractCSS
            ]
        });

        webpack(config, (error) => {
            done(error);
        });
    });

    it('should handle typescript with ts-loader', (done) => {
        // const tsResolver = require.extensions['.ts'];
        // const tsxResolver = require.extensions['.tsx'];
        //
        // require.extensions['.ts'] = void 0 as any;
        // require.extensions['.tsx'] = void 0 as any;

        const config = configFactory('typescript', new TestMachineWebpack({
            failOnError: true,
            testRoots: getTestRoots('typescript'),
            router: (resource) => {
                return `${resource.name}.spec.ts`;
            },
            compilers: [
                compiler.typescript()
            ],
            engine: mochaEngine(DEFAULT_ENGINE_CONFIG)
        }), {
            module: {
                rules: [
                    {
                        test: /\.ts/,
                        use: [
                            {
                                loader: 'babel-loader',
                                options: {
                                    presets: ['es2015']
                                }
                            },
                            {
                                loader: 'ts-loader',
                                options: {
                                    configFile: getRoot('typescript', 'tsconfig.json')
                                }
                            }
                        ]
                    }
                ]
            }
        });

        webpack(config, (error) => {
            // require.extensions['.ts'] = tsResolver;
            // require.extensions['.tsx'] = tsxResolver;

            done(error);
        });
    });
});
