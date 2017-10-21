import { IModulesMap, ITestModule, IMocks, ITestDependency, CompilerFunction } from '../interface';

import { Collection } from './collection';
import { Sandbox } from './sandbox';
import { Compiler } from './compiler';
import { ExceptionProvider } from './exception-provider';

interface ITestDependencies extends IModulesMap<ITestDependency> {}

class SandboxController {

    private resolvedModules: Collection<Sandbox> = new Collection();

    private compiler: CompilerFunction;

    constructor(compiler: Compiler) {
        this.compiler = (source, filename) => compiler.compile(source, filename);
    }

    public getResolvedModules(): IModulesMap<Sandbox> {
        return this.resolvedModules.getStore();
    }

    public clear(): void {
        this.resolvedModules.clear();
    }

    public getTest(resource: string, content: string): any {
        const cachedModule = this.resolvedModules.get(resource);

        if (cachedModule) {
            return cachedModule.getExports();
        }

        const sandbox = this.createTest(content, resource);

        this.resolvedModules.set(resource, sandbox);

        return sandbox.getExports();
    }

    public getModule(module: ITestModule, mocks: IMocks): any {
        const resource = module.getResource();
        const cachedModule = this.resolvedModules.get(resource);

        if (cachedModule) {
            return cachedModule.getExports();
        }

        const dependencies = module.getDependencies();
        const compiledDependencies: ITestDependencies = {};

        let dependency: ITestDependency;

        for (let index = 0, count = dependencies.length; index < count; index++) {
            dependency = dependencies[index];
            compiledDependencies[dependency.request] = this.getModule(dependency.module, mocks);
        }

        let sandbox = this.createModule(module, resource, compiledDependencies, mocks);

        this.resolvedModules.set(resource, sandbox);

        return sandbox.getExports();
    }

    private createSandbox(source: string, resource: string, dependencies?: ITestDependencies, mocks?: IMocks): Sandbox {
        const sandbox = new Sandbox(source, resource, {
            compiler: this.compiler,
            dependencies,
            mocks
        });

        return sandbox;
    }

    private createTest(source: string, resource: string): Sandbox {
        let sandbox;

        try {
            sandbox = this.createSandbox(source, resource);
        } catch (e) {
            throw ExceptionProvider.testCompilationException(e, source, resource);
        }

        return sandbox;
    }

    private createModule(module: ITestModule, resource: string, dependencies?: ITestDependencies, mocks?: IMocks): Sandbox {
        let sandbox;

        try {
            sandbox = this.createSandbox(module.getSource(), resource, dependencies, mocks);
        } catch (e) {
            throw ExceptionProvider.moduleCompilationException(e, module, sandbox);
        }

        return sandbox;
    }
}

export { SandboxController };
