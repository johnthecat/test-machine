import { Plugin } from 'webpack';
import { IConfig } from 'test-machine-core/src/interface';
import { IWebpackConfig, ICompiler, ICompilation, IDefinePlugin, NodeCallback, OptionalParameters } from './interface';

import * as webpack from 'webpack';
import { TestMachine } from 'test-machine-core';
import { webpackModuleFactory } from './lib/test-module-factory';
import { WebpackModulesPreprocessor } from './lib/webpack-modules-preprocessor';
import { definePluginCompilerFactory } from './lib/define-plugin-compiler';

const defaultUserConfig: IWebpackConfig = {
    testRoots: ['./test'],
    router: () => [
        '**/*.spec.js',
        '**/*.test.js'
    ],
    include: [/[^]*/],
    exclude: [/node_modules/],
    compilers: [],
    dependencies: [],
    plugins: [],
    mocks: {},
    watch: false,
    failOnError: false
};

const select = (...args: Array<any>): any => {
    for (let index = 0; index < args.length; index++) {
        if (args[index] !== void 0 && args[index] !== null) {
            return args[index];
        }
    }
};

class TestMachineWebpack implements Plugin {

    private config: IConfig;

    private runner: TestMachine;

    private modulesPreprocessor: WebpackModulesPreprocessor;

    private inProgress = false;

    private isWatching = false;

    private failOnError: boolean;

    constructor(userConfig: OptionalParameters<IWebpackConfig>) {
        if (typeof userConfig.engine !== 'function') {
            throw new Error('Test engine is not specified! You can install test-machine-plugins to get test engine you want.');
        }

        this.config = Object.assign({}, defaultUserConfig, userConfig) as IConfig;

        this.runner = new TestMachine(this.config, webpackModuleFactory, (module) => module.resource);

        this.modulesPreprocessor = new WebpackModulesPreprocessor(this.config as IConfig);

        this.failOnError = select(userConfig.failOnError, defaultUserConfig.failOnError);
    }

    public apply(compiler: ICompiler): void {
        this.isWatching = !!compiler.options.watch;

        const definePlugins = (compiler.options.plugins || []).filter((plugin) => plugin instanceof webpack.DefinePlugin);

        if (definePlugins.length !== 0) {
            definePlugins.forEach((plugin) => {
                this.runner.pushCompiler(definePluginCompilerFactory(plugin as IDefinePlugin));
            });
        }

        compiler.plugin('emit', (compilation: ICompilation, callback: NodeCallback) => {
            if (this.inProgress) {
                return callback();
            }

            this.inProgress = true;

            const modules = this.modulesPreprocessor.filterModules(compilation.modules);
            const changedModules = this.modulesPreprocessor.getChangedModules(modules);

            if (changedModules.length === 0) {
                return callback();
            }

            const modulesMap = this.modulesPreprocessor.getModulesMap(modules);

            this.runner.runTests(modulesMap, changedModules)
                .then(() => {
                    callback();
                })
                .catch((error) => TestMachineWebpack._generateInternalError(
                    error,
                    compilation,
                    this.isWatching,
                    this.failOnError,
                    callback
                ))
                .then(() => {
                    this.inProgress = false;
                });
        });
    }

    private static _generateInternalError(error: Error | void, compilation: any, isWatching: boolean, failOnError: boolean, callback: NodeCallback): void {
        if (!error) {
            error = new Error('Test running failed');
        }

        if (isWatching || !failOnError) {
            compilation.warnings.push(error);
            callback();
        } else {
            compilation.errors.push(error);
            callback(error);
        }
    }
}

export { TestMachineWebpack };
