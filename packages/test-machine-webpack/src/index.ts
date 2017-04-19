import {IConfig} from 'test-machine-core/src/interface';
import {IWebpackConfig, TNodeCallback} from './interface';

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
    watch: false
};

class TestMachineWebpack {

    private config: IConfig;

    private runner: TestMachine;

    private modulesPreprocessor: WebpackModulesPreprocessor;

    private testWatcher: TestWatcher;

    private inProgress = false;

    private isWatching = false;

    private isFirstRun = true;

    private isUserWantWatch: boolean;

    constructor(userConfig: IWebpackConfig) {
        if (typeof userConfig.engine !== 'function') {
            throw new Error('Test engine is not specified! You can install test-machine-plugins to get test engine you want.');
        }

        this.config = Object.assign(defaultUserConfig, userConfig) as IConfig;

        this.runner = new TestMachine(this.config, webpackModuleFactory, (module) => module.resource);

        this.modulesPreprocessor = new WebpackModulesPreprocessor(this.config);

        this.testWatcher = new TestWatcher(this.config.testRoots);

        this.isUserWantWatch = userConfig.watch || false;
    }

    public apply(compiler): void {
        this.isWatching = compiler.options.watch && this.isUserWantWatch;

        const definePlugins = compiler.options.plugins.filter((plugin) => plugin instanceof webpack.DefinePlugin);

        if (definePlugins.length !== 0) {
            definePlugins.forEach((plugin) => {
                this.runner.pushCompiler(definePluginCompilerFactory(plugin));
            });
        }

        compiler.plugin('emit', (compilation: any, callback: TNodeCallback) => {
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
                .then(() => TestMachineWebpack._processTestResult(callback))
                .catch((error) => TestMachineWebpack._generateInternalError(error, callback, this.isWatching))
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

    private static _processTestResult(callback: TNodeCallback): void {
        callback();
    }

    private static _generateInternalError(error: Error, callback: TNodeCallback, isWatching: boolean): void {
        if (isWatching) {
            console.error(error.message);
            callback();
        } else {
            callback(error);
        }
    }
}

export {TestMachineWebpack};
