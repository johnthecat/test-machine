import { IModulesMap, ITestModule, IMocks, ITestDependency, TCompiler } from '../interface';

import { Collection } from './collection';
import { Sandbox } from './sandbox';
import { Compiler } from './compiler';
import { ExceptionProvider } from './exception-provider';

class SandboxController {

    private compiler: TCompiler;

    private modules: Collection<Sandbox> = new Collection<Sandbox>();

    constructor(compiler: Compiler) {
        this.compiler = (source: string, filename: string): string => compiler.compile(source, filename);
    }

    public getResolvedModules(): IModulesMap<Sandbox> {
        return this.modules.getStore();
    }

    public clear(): void {
        this.modules.clear();
    }

    public getModule(module: ITestModule, mocks: IMocks): Sandbox {
        const resource = module.getResource();

        const cachedModule = this.modules.get(resource);

        if (cachedModule) {
            return cachedModule.getExports();
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

        this.modules.set(resource, sandbox);

        return compiledModule;
    }
}

export { SandboxController };
