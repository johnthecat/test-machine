import { IConfig, IModulesMap } from 'test-machine-core/src/interface';
import { IWebpackModule } from '../interface';

class WebpackModulesPreprocessor {

    private lastCompilation: number = Date.now();

    private lastCompiledModules: Array<IWebpackModule>;

    private lastChangedModules: Array<string>;

    constructor(private config: IConfig) {
    }

    public getLastCompilationResult(): Array<IWebpackModule> {
        return this.lastCompiledModules;
    }

    public getLastChangedResult(): Array<string> {
        return this.lastChangedModules;
    }

    public filterModules(modules: Array<IWebpackModule>): Array<IWebpackModule> {
        let flatModules: Array<IWebpackModule>;
        let module: IWebpackModule;

        const testResource = (regExp: RegExp) => regExp.test(module.resource);
        const filteredModules: Array<IWebpackModule> = [];

        let index: number;
        let moduleIndex: number;

        for (index = 0; index < modules.length; index++) {
            flatModules = WebpackModulesPreprocessor.normalizeModules(modules[index]);

            for (moduleIndex = 0; moduleIndex < flatModules.length; moduleIndex++) {
                module = flatModules[moduleIndex];

                if (
                    module.resource &&
                    !this.config.exclude.some(testResource) &&
                    this.config.include.some(testResource)
                ) {
                    filteredModules.push(module);
                }
            }
        }

        this.lastCompiledModules = filteredModules;

        return filteredModules;
    }

    public getChangedModules(modules: Array<IWebpackModule>): Array<string> {
        const changedModules: Array<string> = [];

        let nextCompilationTimestamp = this.lastCompilation;
        let module: IWebpackModule;

        for (let index = 0, count = modules.length; index < count; index++) {
            module = modules[index];

            if (module.buildTimestamp > this.lastCompilation) {
                changedModules.push(module.resource);

                if (module.buildTimestamp > nextCompilationTimestamp) {
                    nextCompilationTimestamp = module.buildTimestamp;
                }
            }
        }

        this.lastCompilation = nextCompilationTimestamp;
        this.lastChangedModules = changedModules;

        return changedModules;
    }

    public getModulesMap(modules: Array<IWebpackModule>): IModulesMap<IWebpackModule> {
        return modules.reduce(WebpackModulesPreprocessor.pushModuleToMap, {});
    }

    private static normalizeModules(module: any): Array<IWebpackModule> {
        switch (module.constructor.name) {
            // webpack.optimize.ModuleConcatenationPlugin
            // https://github.com/webpack/webpack/blob/master/lib/optimize/ConcatenatedModule.js
            case 'ConcatenatedModule':
                return module.modules.concat(module.rootModule);

            // extract-text-webpack-plugin
            // https://github.com/webpack-contrib/extract-text-webpack-plugin/blob/master/ExtractedModule.js
            case 'ExtractedModule':
                return [module.getOriginalModule()];

            default:
                return [module];
        }
    }

    private static pushModuleToMap(map: IModulesMap<IWebpackModule>, module: IWebpackModule): IModulesMap<IWebpackModule> {
        map[module.resource] = module;

        return map;
    }
}

export { WebpackModulesPreprocessor };
