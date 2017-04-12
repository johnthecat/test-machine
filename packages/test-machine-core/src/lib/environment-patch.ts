import {IMocks} from '../interface';

import * as process from 'process';
import {SandboxController} from './sandbox-controller';

type TLoadFunction = (request: string, parent: NodeModule, isMain: boolean) => any;

const Module: any = module.constructor;

class EnvironmentPatch {

    private root: string;

    private temporaryCache: object;

    private modulesDefinition: object;

    private originLoad: TLoadFunction;

    private fakeLoad: TLoadFunction;

    /**
     * Removing one record from require.cache
     */
    public static removeFromCache(name: string): void {
        delete require.cache[name];
    }

    constructor(sandboxes: SandboxController, private dependencies: Array<string>, private mocks: IMocks) {

        this.root = process.cwd();

        this.temporaryCache = Object.create(null);

        this.originLoad = Module._load;

        this.fakeLoad = (request: string, parent: NodeModule, isMain: boolean) => {
            const filename = Module._resolveFilename(request, parent, isMain);

            if (this.modulesDefinition[filename]) {
                return sandboxes.getModule(this.modulesDefinition[filename], this.mocks);
            }

            return this.originLoad(request, parent, isMain);
        };
    }

    setup(modulesDefinition): void {
        this.modulesDefinition = modulesDefinition;

        this.patch();

        for (let index = 0; index < this.dependencies.length; index++) {
            require(this.dependencies[index]);
        }
    }

    clean(tests: Array<string>, mocks: IMocks): void {
        this.temporaryCache = Object.create(null);
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

    /**
     * Patching default filename resolver
     */
    private patch(): void {
        Module._load = this.fakeLoad;
    }

    /**
     * Removing path from filename resolver
     */
    private restore(): void {
        Module._load = this.originLoad;
    }
}

export {EnvironmentPatch};
