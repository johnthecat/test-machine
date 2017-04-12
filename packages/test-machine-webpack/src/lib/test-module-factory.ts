import {TModulesFactory, ITestDependency} from 'test-machine-core/src/interface';
import {IWebpackModule} from '../interface';

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
            if (this._dependencyCache) {
                return this._dependencyCache;
            }

            const webpackDependencies = this._module.dependencies;
            const dependencies: Array<ITestDependency> = [];

            let dependency;
            let module;

            for (let index = 0, count = webpackDependencies.length; index < count; index++) {
                dependency = webpackDependencies[index].module;

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