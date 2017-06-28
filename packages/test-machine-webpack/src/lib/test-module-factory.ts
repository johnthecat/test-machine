import { TModulesFactory, ITestDependency } from 'test-machine-core/src/interface';
import { IWebpackModule, IWebpackDependency } from '../interface';

// for cases, when dependency hasn't typical interface to extract it's own module
const normalizeDependency = (dependency: any): IWebpackDependency => {
    switch (dependency.constructor.name) {
        default:
            return dependency.module;
    }
};

export const webpackModuleFactory: TModulesFactory<IWebpackModule> = (module: IWebpackModule, resolver) => {
    return {

        _dependencyCache: null,

        _resolver: resolver,

        _module: module,

        getResource(): string {
            return this._module.resource;
        },

        getSource(): string {
            return this._module._source._value;
        },

        getDependencies(): Array<ITestDependency> {
            if (this._dependencyCache !== null) {
                return this._dependencyCache;
            }

            const webpackDependencies = this._module.dependencies;
            const dependencies: Array<ITestDependency> = [];

            let dependency;
            let module;

            for (let index = 0, count = webpackDependencies.length; index < count; index++) {
                dependency = normalizeDependency(webpackDependencies[index]);

                if (!dependency) {
                    continue;
                }

                module = this._resolver(dependency.resource);

                if (module) {
                    dependencies.push({
                        request: dependency.rawRequest,
                        module: module
                    });
                }
            }

            this._dependencyCache = dependencies;

            return dependencies;
        }
    };
};
