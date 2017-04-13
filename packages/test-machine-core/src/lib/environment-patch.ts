import {IMocks, IModulesMap, ITestModule} from '../interface';
import {SandboxController} from './sandbox-controller';

type TLoadFunction = (request: string, parent: NodeModule, isMain: boolean) => any;

const Module: any = module.constructor;

class EnvironmentPatch {

    private modulesDefinition: IModulesMap<ITestModule>;

    private originLoad: TLoadFunction;

    private fakeLoad: TLoadFunction;

    public static removeFromCache(name: string): void {
        delete require.cache[name];
    }

    constructor(private sandboxes: SandboxController, private dependencies: Array<string>, private mocks: IMocks) {

        this.originLoad = Module._load;

        this.fakeLoad = (request: string, parent: NodeModule, isMain: boolean) => {
            const filename = Module._resolveFilename(request, parent, isMain);

            if (this.modulesDefinition[filename]) {
                return this.sandboxes.getModule(this.modulesDefinition[filename], this.mocks);
            }

            return this.originLoad(request, parent, isMain);
        };
    }

    setup(modulesDefinition: IModulesMap<ITestModule>): void {
        this.modulesDefinition = modulesDefinition;

        this.patch();

        for (let index = 0; index < this.dependencies.length; index++) {
            require(this.dependencies[index]);
        }
    }

    clean(tests: Array<string>, mocks: IMocks): void {
        this.modulesDefinition = {};

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
}

export {EnvironmentPatch};
