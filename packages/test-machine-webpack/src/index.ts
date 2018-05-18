import { IConfig } from 'test-machine-interfaces';
import {
    IWebpackConfig,
    IWebpackCompiler,
    IWebpackModule,
    IWebpackCompilation,
    IDefinePlugin,
    OptionalParameters
} from './interface';

import * as webpack from 'webpack';
import { TestMachine } from 'test-machine-core';
import { optionSelector } from './lib/option-selector';
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

class TestMachineWebpack implements webpack.Plugin {

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

        this.runner = new TestMachine(this.config, webpackModuleFactory, (module: IWebpackModule) => module.resource);

        this.modulesPreprocessor = new WebpackModulesPreprocessor(this.config as IConfig);

        this.failOnError = optionSelector(userConfig.failOnError, defaultUserConfig.failOnError);
    }

    public apply(compiler: IWebpackCompiler): void {
        this.isWatching = optionSelector(compiler.options.watch, false);

        const definePlugins = (compiler.options.plugins || []).filter((plugin) => plugin instanceof webpack.DefinePlugin);

        if (definePlugins.length !== 0) {
            definePlugins.forEach((plugin) => {
                this.runner.pushCompiler(definePluginCompilerFactory(plugin as IDefinePlugin));
            });
        }

        compiler.hooks.emit.tapPromise('TestMachine', (compilation) => {
            if (this.inProgress) {
                return Promise.resolve();
            }

            this.inProgress = true;

            const modules = this.modulesPreprocessor.filterModules(compilation.modules);
            const changedModules = this.modulesPreprocessor.getChangedModules(modules);
            const modulesMap = this.modulesPreprocessor.getModulesMap(modules);

            return this.runner.runTests(modulesMap, changedModules)
                .then(() => {
                    this.inProgress = false;
                })
                .catch((error) => {
                    this.inProgress = false;

                    return TestMachineWebpack._generateInternalError(
                        error,
                        compilation,
                        this.isWatching,
                        this.failOnError
                    );
                });
        });
    }

    private static _generateInternalError(
        error: NodeJS.ErrnoException,
        compilation: IWebpackCompilation,
        isWatching: boolean,
        failOnError: boolean
    ): Promise<void> {
        if (!error) {
            error = new Error('Test running failed');
        }

        if (isWatching || !failOnError) {
            compilation.warnings.push(error);

            return Promise.resolve();
        } else {
            compilation.errors.push(error);

            return Promise.reject(error);
        }
    }
}

export { TestMachineWebpack };
