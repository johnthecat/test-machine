import {Plugin} from 'webpack';
import {IConfig} from 'test-machine-core/src/interface';
import {IWebpackConfig, ICompiler, ICompilation, IDefinePlugin, TNodeCallback} from './interface';

import * as webpack from 'webpack';
import {TestMachine} from 'test-machine-core';
import {webpackModuleFactory} from './lib/test-module-factory';
import {WebpackModulesPreprocessor} from './lib/webpack-modules-preprocessor';
import {TestWatcher} from './lib/test-watcher';
import {definePluginCompilerFactory} from './lib/define-plugin-compiler';

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
    failOnError: true
};

class TestMachineWebpack implements Plugin {

    private config: IConfig;

    private runner: TestMachine;

    private modulesPreprocessor: WebpackModulesPreprocessor;

    private testWatcher: TestWatcher;

    private inProgress = false;

    private isWatching = false;

    private failOnError = false;

    private isFirstRun = true;

    private isUserWantToWatch: boolean;

    constructor(userConfig: IWebpackConfig) {
        if (typeof userConfig.engine !== 'function') {
            throw new Error('Test engine is not specified! You can install test-machine-plugins to get test engine you want.');
        }

        this.config = Object.assign(defaultUserConfig, userConfig) as IConfig;

        this.runner = new TestMachine(this.config, webpackModuleFactory, (module) => module.resource);

        this.modulesPreprocessor = new WebpackModulesPreprocessor(this.config as IConfig);

        this.testWatcher = new TestWatcher(this.config.testRoots);

        this.isUserWantToWatch = userConfig.watch || false;

        this.failOnError = defaultUserConfig.failOnError || userConfig.failOnError || this.failOnError;
    }

    public apply(compiler: ICompiler): void {
        this.isWatching = !!(compiler.options.watch && this.isUserWantToWatch);

        const definePlugins = (compiler.options.plugins || []).filter((plugin) => plugin instanceof webpack.DefinePlugin);

        if (definePlugins.length !== 0) {
            definePlugins.forEach((plugin) => {
                this.runner.pushCompiler(definePluginCompilerFactory(plugin as IDefinePlugin));
            });
        }

        // console.log(compiler);
        // process.exit(0);

        compiler.plugin('emit', (compilation: ICompilation, callback: TNodeCallback) => {
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
                .catch(() => TestMachineWebpack._generateInternalError(
                    compilation,
                    this.isWatching,
                    this.failOnError,
                    callback
                ))
                .then(() => {
                    this.inProgress = false;
                });

            if (this.isFirstRun) {
                this.isFirstRun = false;

                if (compiler.options.watch) {
                    this._setupFSWatch();
                }
            }
        });
    }

    private _setupFSWatch(): void {
        this.testWatcher.setup(() => {
            if (this.inProgress) {
                return;
            }

            this.inProgress = true;
            this.runner.clearTestsFSCache();
            this.runner.runTests(
                this.modulesPreprocessor.getLastCompilationResult(),
                this.modulesPreprocessor.getLastChangedResult()
            )
                .catch((error) => {
                    this.inProgress = false;
                    console.error(error);
                })
                .then(() => {
                    this.inProgress = false;
                });
        });
    }

    private static _generateInternalError(compilation: any, isWatching: boolean, failOnError: boolean, callback: TNodeCallback): void {
        const error = new Error('Test running failed');

        if (isWatching || !failOnError) {
            compilation.warnings.push(error);
            callback();
        } else {
            compilation.errors.push(error);
            callback(error);
        }
    }
}

export {TestMachineWebpack};
