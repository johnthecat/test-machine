/// <reference types="mocha" />

import * as path from 'path';
import * as chai from 'chai';
import * as webpack from 'webpack';
import { configFactory, getTestRoots } from './utils/webpack.config';
import { mochaEngine } from '../../test-machine-plugins/src/engines/mocha';
import { babelCompiler } from '../../test-machine-plugins/src/compilers/babel';
import { IWebpackConfig } from '../src/interface';
import { TestMachineWebpack } from '../src';

import * as ExtractTextPlugin from 'extract-text-webpack-plugin';

describe('Webpack plugin', () => {
    it('should fail, if engine not passed', (done) => {
        try {
            const plugin = new TestMachineWebpack({} as IWebpackConfig);

            done(`No exception ${plugin}`);
        } catch (e) {
            done();
        }
    });

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

    it('should correctly work with webpack.optimize.ModuleConcatenationPlugin', (done) => {
        const config = configFactory('simple-js', new TestMachineWebpack({
            testRoots: getTestRoots('simple-js'),
            router: (resource) => {
                return `${resource.name}.spec.js`;
            },
            engine: mochaEngine({
                reporter(): void {

                }
            })
        }), {
            plugins: [
                new (webpack.optimize as any).ModuleConcatenationPlugin()
            ]
        });

        const runner = webpack(config);

        runner.run((error) => {
            done(error);
        });
    });

    it('should not fail test, if "failOnError" is false', (done) => {
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

    xit('should handle other non-typical extensions', (done) => {
        const extractCSS = new ExtractTextPlugin('stylesheets/css-modules.css');
        const config = configFactory('css-modules', new TestMachineWebpack({
            testRoots: getTestRoots('css-modules'),
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

    // TODO add tests for custom loaders resolve
});
