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
        let module: IWebpackModule;

        const testResource = (regExp) => regExp.test(module.resource);
        const filteredModules: Array<IWebpackModule> = [];

        for (let index = 0, count = modules.length; index < count; index++) {
            module = modules[index];

            if (
                module.resource &&
                !this.config.exclude.some(testResource) &&
                this.config.include.some(testResource)
            ) {
                filteredModules.push(module);
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

    private static pushModuleToMap(map: IModulesMap<IWebpackModule>, module: IWebpackModule): IModulesMap<IWebpackModule> {
        map[module.resource] = module;

        return map;
    }
}

export { WebpackModulesPreprocessor };
