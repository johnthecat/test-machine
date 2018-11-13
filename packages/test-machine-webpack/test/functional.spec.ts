/// <reference types="mocha" />

import * as path from 'path';
import * as chai from 'chai';
import * as webpack from 'webpack';
import { compiler, engine } from 'test-machine-plugins';
import { configFactory, getRoot, getTestRoots } from './utils/webpack.config';
import { TestMachineWebpack } from '../src';

import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

const DEFAULT_ENGINE_CONFIG = {};

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
            router: (resource) => `${resource.name}.spec.js`,
            engine: (tests) => {
                try {
                    chai.expect(tests).to.have.members([
                        path.join(root, 'module-b.spec.js'),
                        path.join(root, 'module-a.spec.js')
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

    it('should correctly work production mode', (done) => {
        const config = configFactory('module-concatenation-plugin', new TestMachineWebpack({
            failOnError: true,
            testRoots: getTestRoots('module-concatenation-plugin'),
            router: (resource) => `${resource.name}.spec.js`,
            compilers: [
                compiler.babel({
                    plugins: ['transform-es2015-modules-commonjs']
                })
            ],
            engine: engine.mocha(DEFAULT_ENGINE_CONFIG)
        }), {
            mode: 'production'
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
            router: (resource) => `${resource.name}.spec.js`,
            compilers: [
                compiler.babel({
                    presets: [
                        ['@babel/preset-env', {
                            targets: 'ie 9-11'
                        }]
                    ]
                })
            ],
            engine: engine.mocha(DEFAULT_ENGINE_CONFIG)
        }));

        webpack(config, (error) => {
            done(error);
        });
    });

    it('should correctly handle different types of imports (using babel-loader)', (done) => {
        const config = configFactory('es6-export', new TestMachineWebpack({
            failOnError: true,
            testRoots: getTestRoots('es6-export'),
            router: (resource) => `${resource.name}.spec.js`,
            engine: engine.mocha(DEFAULT_ENGINE_CONFIG)
        }), {
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ['@babel/preset-env', {
                                        targets: 'ie 9-11'
                                    }]
                                ]
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
            engine: engine.mocha(DEFAULT_ENGINE_CONFIG)
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
            engine: engine.mocha(DEFAULT_ENGINE_CONFIG)
        }));

        webpack(config, (error) => {
            done(error);
        });
    });

    it('should handle css with MiniCssExtractPlugin', (done) => {
        const extractCSS = new MiniCssExtractPlugin({
            filename: 'stylesheets/[name].css'
        });

        const plugin = new TestMachineWebpack({
            failOnError: true,
            testRoots: getTestRoots('css-modules'),
            engine: engine.mocha(DEFAULT_ENGINE_CONFIG),
            router: (resource) => `${resource.name}.spec.js`
        });

        const config = configFactory('css-modules', plugin, {
            plugins: [
                extractCSS
            ],
            module: {
                rules: [
                    {
                        test: /\.css$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: true
                                }
                            }
                        ]
                    }
                ]
            }
        });

        webpack(config, (error) => {
            done(error);
        });
    });

    it('should handle typescript with ts-loader', (done) => {
        const config = configFactory('typescript', new TestMachineWebpack({
            failOnError: true,
            testRoots: getTestRoots('typescript'),
            router: (resource) => {
                return `${resource.name}.spec.ts`;
            },
            compilers: [
                compiler.typescript()
            ],
            engine: engine.mocha(DEFAULT_ENGINE_CONFIG)
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
                                    configFile: getRoot('typescript', 'tsconfig.json'),
                                    silent: true
                                }
                            }
                        ]
                    }
                ]
            }
        });

        webpack(config, (error) => {
            done(error);
        });
    });
});
