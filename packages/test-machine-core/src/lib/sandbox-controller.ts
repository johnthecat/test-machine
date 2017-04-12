import {IModulesMap, ITestModule, IMocks, ITestDependency, TCompiler} from '../interface';

import {Sandbox} from './sandbox';
import {Compiler} from './compiler';
import {ExceptionProvider} from './exception-provider';

class SandboxController {

    private compiler: TCompiler;

    private cache: IModulesMap<Sandbox> = Object.create(null);

    constructor(compiler: Compiler) {
        this.compiler = (source: string, filename: string): string => compiler.compile(source, filename);
    }

    public getResolvedModules(): IModulesMap<Sandbox> {
        return this.cache;
    }

    public clean(): void {
        this.cache = Object.create(null);
    }

    public getModule(module: ITestModule, mocks: IMocks): Sandbox {
        const resource = module.getResource();

        if (resource in this.cache) {
            return this.cache[resource].getExports();
        }

        const dependencies = module.getDependencies();
        const compiledDependencies = {};

        let dependency: ITestDependency;

        for (let index = 0, count = dependencies.length; index < count; index++) {
            dependency = dependencies[index];
            compiledDependencies[dependency.request] = this.getModule(dependency.module, mocks);
        }

        let sandbox;
        let compiledModule;

        try {
            sandbox = new Sandbox(module.getSource(), resource, {
                compiler: this.compiler,
                dependencies: compiledDependencies,
                mocks: mocks
            });

            compiledModule = sandbox.getExports();
        } catch (e) {
            throw ExceptionProvider.compilationException(e, module, sandbox);
        }

        this.cache[resource] = sandbox;

        return compiledModule;
    }
}

export {SandboxController};