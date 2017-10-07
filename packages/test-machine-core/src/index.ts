import { IConfig, IModulesMap, Engine, CompilerPlugin, PathResolver, ModulesFactory } from './interface';

import { Compiler } from './lib/compiler';
import { EnvironmentPatch } from './lib/environment-patch';
import { ModulesGenerator } from './lib/modules-generator';
import { TestExtractor } from './lib/test-extractor';
import { PluginController } from './lib/plugin-controller';
import { SandboxController } from './lib/sandbox-controller';

import { isNullOrUndefined } from './lib/utils';

class TestMachine {

    private engine: Engine;

    private compiler: Compiler;

    private testExtractor: TestExtractor;

    private environmentPatch: EnvironmentPatch;

    private plugins: PluginController;

    private sandboxes: SandboxController;

    private modulesGenerator: ModulesGenerator;

    constructor(private config: IConfig, modulesFactory: ModulesFactory<any>, resolver: PathResolver) {

        this.engine = config.engine;

        this.compiler = new Compiler(config.compilers);

        this.testExtractor = new TestExtractor(config.testRoots, config.router);

        this.modulesGenerator = new ModulesGenerator(modulesFactory, resolver);

        this.plugins = new PluginController(config.plugins);

        this.sandboxes = new SandboxController(this.compiler);

        this.environmentPatch = new EnvironmentPatch(this.sandboxes, config.dependencies, config.mocks);

        this.init();
    }

    public clearTestsFSCache(): void {
        this.testExtractor.clearCache();
    }

    public pushCompiler(compiler: CompilerPlugin): void {
        this.compiler.push(compiler);
    }

    public runTests(modules: IModulesMap<any>, changedModules?: Array<string>): Promise<void> {
        const modulesMap = this.modulesGenerator.convertModules(modules);

        if (isNullOrUndefined(changedModules)) {
            changedModules = Object.keys(modules);
        }

        const tests = this.testExtractor.extractTests(changedModules);

        if (tests.length === 0) {
            return Promise.resolve();
        }

        this.environmentPatch.setup(modulesMap);

        return this.engine(tests)
            .then(() => {
                this.afterRun(tests);
            })
            .catch((exception) => {
                this.afterRun(tests);
                throw exception;
            });
    }

    private init(): void {
        this.plugins.applyCompilerPipeline(this.compiler);
    }

    private afterRun(tests: Array<string>): void {
        this.plugins.applyAfterRun(this.sandboxes.getResolvedModules());

        this.sandboxes.clear();
        this.environmentPatch.clean(tests, this.config.mocks);
    }
}

export { TestMachine };
