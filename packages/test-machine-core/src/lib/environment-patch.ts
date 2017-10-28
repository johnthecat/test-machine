import { IMocks, IModulesMap, ITestModule } from 'test-machine-interfaces';
import { Collection } from './collection';
import { SandboxController } from './sandbox-controller';

type LoadFunction = (request: string, parent: NodeModule, isMain: boolean) => any;

const Module: any = module.constructor;

class EnvironmentPatch {

    private originLoad: LoadFunction;

    private fakeLoad: LoadFunction;

    private tests: Collection<string> = new Collection();

    private modulesDefinition: Collection<ITestModule> = new Collection();

    constructor(private sandboxes: SandboxController, private dependencies: Array<string>, private mocks: IMocks) {

        this.originLoad = Module._load;

        this.fakeLoad = (request: string, parent: NodeModule, isMain: boolean) => {
            const filename = Module._resolveFilename(request, parent, isMain);

            if (this.modulesDefinition.has(filename)) {
                return this.sandboxes.getModule(this.modulesDefinition.get(filename) as ITestModule, this.mocks);
            }

            if (this.tests.has(filename)) {
                return this.sandboxes.getTest(filename, this.tests.get(filename) as string);
            }

            return this.originLoad(request, parent, isMain);
        };
    }

    public setup(tests: IModulesMap<string>, modulesDefinition: IModulesMap<ITestModule>): void {
        this.modulesDefinition.fill(modulesDefinition);
        this.tests.fill(tests);

        this.patch();

        for (let index = 0; index < this.dependencies.length; index++) {
            require(this.dependencies[index]);
        }
    }

    public clean(tests: Array<string>, mocks: IMocks): void {
        this.modulesDefinition.clear();

        this.restore();

        for (let index = 0; index < tests.length; index++) {
            EnvironmentPatch.removeFromCache(tests[index]);
        }

        for (let index = 0; index < this.dependencies.length; index++) {
            EnvironmentPatch.removeFromCache(this.dependencies[index]);
        }

        for (let key in mocks) {
            if (mocks.hasOwnProperty(key)) {
                EnvironmentPatch.removeFromCache(mocks[key]);
            }
        }
    }

    private patch(): void {
        Module._load = this.fakeLoad;
    }

    private restore(): void {
        Module._load = this.originLoad;
    }

    public static removeFromCache(name: string): void {
        delete require.cache[name];
    }
}

export { EnvironmentPatch };
