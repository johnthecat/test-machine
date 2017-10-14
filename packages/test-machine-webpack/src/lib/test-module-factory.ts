import { ModulesFactory, ITestModule, ITestDependency, ModuleResolver } from 'test-machine-core/src/interface';
import { IWebpackModule, IWebpackDependency } from '../interface';

// for cases, when dependency hasn't typical interface to extract it's own module
const normalizeDependency = (dependency: any): IWebpackModule => {
    switch (dependency.constructor.name) {
        default:
            return dependency.module;
    }
};

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
            dependency = normalizeDependency(webpackDependencies[index]);

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
