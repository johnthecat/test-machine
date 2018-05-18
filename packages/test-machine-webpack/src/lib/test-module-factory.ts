import { ModulesFactory, ITestModule, ITestDependency, ModuleResolver } from 'test-machine-interfaces';
import { IWebpackModule, IWebpackDependency } from '../interface';

export class WebpackModule implements ITestModule {

    private dependencyCache: Array<ITestDependency> | null = null;

    constructor(private module: IWebpackModule, private resolver: ModuleResolver) {}

    getResource(): string {
        return this.module.resource;
    }

    getSource(): string {
        return this.module._source._value;
    }

    getDependencies(): Array<ITestDependency> {
        if (this.dependencyCache !== null) {
            return this.dependencyCache;
        }

        const webpackDependencies: Array<IWebpackDependency> = this.module.dependencies;
        const dependencies: Array<ITestDependency> = [];

        let dependency: IWebpackModule;
        let module: ITestModule;

        for (let index = 0, count = webpackDependencies.length; index < count; index++) {
            dependency = webpackDependencies[index].module;

            if (!dependency) {
                continue;
            }

            module = this.resolver(dependency.resource);

            if (module) {
                dependencies.push({
                    request: dependency.rawRequest,
                    module: module
                });
            }
        }

        this.dependencyCache = dependencies;

        return dependencies;
    }
}

export const webpackModuleFactory: ModulesFactory<IWebpackModule> = (module: IWebpackModule, resolver: ModuleResolver) => {
    return new WebpackModule(module, resolver);
};
